import {
  BrowserTabs,
  Collections,
  LegacyStorageKey,
  recentKey,
  RecentTabs,
  Settings,
  settingsStorageKey,
  StorageArea,
  StorageData,
  TabId,
  TabsStore,
  UUID,
} from './models';
import { getSettings, getUrlHost, isUuid } from './utils';

/**
 * Returns storage in use.
 */
export async function getStorage(): Promise<StorageArea> {
  const settings: Settings = await getSettings();

  if (typeof settings?.syncStorage === 'undefined') {
    const localBytes = await chrome.storage.local.getBytesInUse();
    const syncBytes = await chrome.storage.sync.getBytesInUse();

    return syncBytes >= localBytes ? chrome.storage.sync : chrome.storage.local;
  }

  return settings?.syncStorage ? chrome.storage.sync : chrome.storage.local;
}

/**
 * Saves collections to storage.
 */
export async function saveCollections(collections: Collections): Promise<void> {
  const storage = await getStorage();
  const storageData: StorageData = (await storage.get()) ?? {};
  const collectionsById = new Map(collections?.map((collection) => [collection.id, collection]));

  const removeKeys = [];
  for (const groupId in storageData) {
    if (isUuid(groupId as UUID) && !collectionsById.has(groupId as UUID)) {
      delete storageData[groupId];
      removeKeys.push(groupId as UUID);
    }
  }

  await storage.remove(removeKeys as string[]);

  if (collections?.length > 0) {
    collections.forEach(({ tabs, timestamp, id }) => (storageData[id] = [timestamp, tabsToSync(tabs)]));

    collections.forEach(({ tabs }) =>
      tabs.filter(({ favIconUrl }) => favIconUrl).forEach((tab) => (storageData[getUrlHost(tab.url)] = tab.favIconUrl))
    );

    return await storage.set({
      ...storageData,
    });
  }
}

export async function getRecentTabs(): Promise<RecentTabs> {
  const storage = await getStorage();
  const recentStore: { [recentKey]: RecentTabs } = await storage.get(recentKey);
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
  const storageData: StorageData = await storage.get();

  if (storageData) {
    const collections: Collections = Object.keys(storageData)
      .filter((groupId: UUID) => isUuid(groupId))
      .map((groupId: UUID) => ({
        id: groupId,
        timestamp: storageData[groupId][0],
        tabs: syncToTabs(storageData[groupId][1]).map((tab) => {
          const host = getUrlHost(tab.url);
          if (typeof storageData[host] === 'string') {
            tab.favIconUrl = storageData[host];
          }
          return tab;
        }),
      }));

    return collections.length > 0 ? collections : null;
  }
};

/**
 * Converts BrowserTabs to tabs structure used in storage.
 */
export function tabsToSync(tabs: BrowserTabs): TabsStore {
  return tabs.map(({ id, url, title }) => [id, url, title]);
}

/**
 * Converts storage tabs to BrowserTabs.
 */
export function syncToTabs(sync: TabsStore): BrowserTabs {
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
  if (source !== target) {
    const sourceData: StorageData = await source.get();
    const keys = Object.keys(sourceData).filter((key) => key !== settingsStorageKey);

    if (keys.length > 0) {
      const newData: StorageData = {};
      const legacyKeys: LegacyStorageKey[] = ['settings', 'favicon', 'recent'];

      keys
        .filter((key: LegacyStorageKey) => !legacyKeys.includes(key))
        .forEach((key) => {
          if (sourceData[key] !== undefined) {
            newData[key] = sourceData[key];
          }
        });

      await target.set(newData);
      await source.remove([...keys, ...legacyKeys]);
    }
  }
}
