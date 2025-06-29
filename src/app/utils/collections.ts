import {
  BrowserTabs,
  Collection,
  Collections,
  FaviconHost,
  faviconStorageKey,
  recentKey,
  RecentTabs,
  Settings,
  StorageArea,
  SyncData,
  SyncTabs,
  TabId,
  UUID,
} from './models';
import { getSettings, getUrlHost, isUuid } from './utils';

/**
 * Returns storage in use.
 */
export async function getStorage(): Promise<StorageArea> {
  const settings: Settings = await getSettings();
  return typeof settings?.syncStorage === 'undefined' || settings?.syncStorage
    ? chrome.storage.sync
    : chrome.storage.local;
}

/**
 * Saves collections to storage.
 */
export async function saveCollections(collections: Collections): Promise<void> {
  const storage = await getStorage();
  const syncData: SyncData = (await storage.get()) ?? {};
  const collectionsById: Map<string, Collection> = new Map(
    collections?.map((collection) => [collection.id, collection])
  );

  const removeKeys = [faviconStorageKey];
  for (const groupId in syncData) {
    if (isUuid(groupId as UUID) && !collectionsById.has(groupId)) {
      delete syncData[groupId];
      removeKeys.push(groupId as UUID);
    }
  }

  await storage.remove(removeKeys as string[]);

  delete syncData[faviconStorageKey];

  if (collections?.length > 0) {
    collections.forEach(({ tabs, timestamp, id }) => (syncData[id] = [timestamp, tabsToSync(tabs)]));

    const favicon: FaviconHost = {};
    collections.forEach(({ tabs }) =>
      tabs.filter(({ favIconUrl }) => favIconUrl).forEach((tab) => (favicon[getUrlHost(tab.url)] = tab.favIconUrl))
    );

    return await storage.set({
      [faviconStorageKey]: favicon,
      ...syncData,
    });
  }
}

export async function getFaviconStore(): Promise<FaviconHost> {
  const storage = await getStorage();
  const favicon = await storage.get(faviconStorageKey);
  return favicon[faviconStorageKey] ?? {};
}

export async function getRecentTabs(): Promise<RecentTabs> {
  const storage = await getStorage();
  const recentStore = await storage.get(recentKey);
  return recentStore[recentKey];
}

export async function addRecent(...tabIds: TabId[]) {
  const recentTabs: RecentTabs = (await getRecentTabs()) ?? {};
  const storage = await getStorage();

  const timestamp = new Date().getTime();
  tabIds.forEach((id) => (recentTabs[id] = timestamp));

  await storage.set({
    [recentKey]: recentTabs,
  });
}

export async function removeRecent(tabId: TabId | TabId[]) {
  const recentTabs = (await getRecentTabs()) ?? {};
  const storage = await getStorage();

  if (Array.isArray(tabId)) {
    tabId.forEach((id) => delete recentTabs[id]);
  } else if (tabId in recentTabs) {
    delete recentTabs[tabId];
  }

  await storage.remove(recentKey as string);
  await storage.set({
    [recentKey]: recentTabs,
  });
}

/**
 * Returns saved collections from storage.
 */
export const getCollections = async (): Promise<Collections> => {
  const storage = await getStorage();
  const syncData: SyncData = await storage.get();

  if (syncData) {
    const favicon = await getFaviconStore();

    const collections: Collections = Object.keys(syncData)
      .filter((groupId: UUID) => isUuid(groupId))
      .map((groupId) => ({
        id: groupId,
        timestamp: syncData[groupId][0],
        tabs: syncToTabs(syncData[groupId][1]).map((tab) => {
          tab.favIconUrl = favicon[getUrlHost(tab.url)];
          return tab;
        }),
      }));

    return collections.length > 0 ? collections : null;
  }
};

/**
 * Converts BrowserTabs to tabs structure used in storage.
 */
export function tabsToSync(tabs: BrowserTabs): SyncTabs {
  return tabs.map(({ id, url, title }) => [id, url, title]);
}

/**
 * Converts storage tabs to BrowserTabs.
 */
export function syncToTabs(sync: SyncTabs): BrowserTabs {
  return sync.map(([id, url, title]) => ({
    id,
    title,
    url,
  }));
}

/**
 * Copies source storage collection to target storage.
 */
export async function copyStorage(source: StorageArea, target: StorageArea) {
  const sourceData: SyncData = await source.get();
  const newData = {};

  [faviconStorageKey, recentKey].forEach((key) => {
    if (sourceData[key]) {
      newData[key] = sourceData[key];
    }
  });

  const groupUuidKeys = Object.keys(sourceData).filter((groupId: UUID) => isUuid(groupId)) as UUID[];
  groupUuidKeys.forEach((key) => (newData[key] = sourceData[key]));

  await source.remove([faviconStorageKey, recentKey, ...groupUuidKeys] as string[]);
  await target.set(newData);
}
