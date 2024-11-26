import { isUndefined, keyBy } from 'lodash-es';

import {
  BrowserTabs,
  Collection,
  Collections,
  FaviconHost,
  faviconStorageKey,
  FaviconSync,
  RECENT_LIMIT,
  recentKey,
  RecentTabs,
  Settings,
  StorageArea,
  SyncData,
  SyncTabs,
  TabId,
} from './models';
import { getSettings, getUrlHost, isUuid } from './utils';

/**
 * Returns storage in use.
 */
export async function getStorage(): Promise<StorageArea> {
  const settings: Settings = await getSettings();
  return isUndefined(settings?.syncStorage) || settings?.syncStorage ? chrome.storage.sync : chrome.storage.local;
}

/**
 * Saves collections to storage.
 */
export async function saveCollections(collections: Collections): Promise<void> {
  const storage = await getStorage();
  const syncData: SyncData = (await storage.get()) ?? {};
  const collectionsById: { [id: string]: Collection } = keyBy(collections, 'id');

  const removeKeys = [faviconStorageKey];
  for (const groupId in syncData) {
    if (isUuid(groupId) && !(groupId in collectionsById)) {
      delete syncData[groupId];
      removeKeys.push(groupId);
    }
  }

  await storage.remove([...removeKeys, faviconStorageKey]);

  delete syncData[faviconStorageKey];

  if (collections?.length > 0) {
    collections.forEach(({ tabs, timestamp, id }) => (syncData[id] = [timestamp, tabsToSync(tabs)]));

    const favicon: FaviconHost = {};
    collections.forEach(({ tabs }) =>
      tabs.filter(({ favIconUrl }) => favIconUrl).forEach((tab) => (favicon[getUrlHost(tab.url)] = tab.favIconUrl))
    );

    return storage.set({
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
  return recentStore[recentKey] ?? {};
}

export async function addRecent(tabId: TabId) {
  const recentTabs: RecentTabs = (await getRecentTabs()) ?? {};
  const storage = await getStorage();

  const timestamp = new Date().getTime();
  recentTabs[tabId] = timestamp;
  const tabIds = Object.keys(recentTabs).sort((a, b) => recentTabs[b] - recentTabs[a]);

  if (tabIds?.length > RECENT_LIMIT) {
    tabIds.slice(RECENT_LIMIT).forEach((id) => delete recentTabs[id]);
  }

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

  await storage.remove(recentKey);
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
      .filter((groupId) => isUuid(groupId))
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
  const faviconData: FaviconSync = {
    [faviconStorageKey]: sourceData[faviconStorageKey],
  };
  const newData = { ...faviconData };

  const sourceKeys = Object.keys(sourceData).filter((groupId) => isUuid(groupId));
  sourceKeys.forEach((key) => (newData[key] = sourceData[key]));
  await source.remove([faviconStorageKey, ...sourceKeys.map((key) => key)]);
  await target.set(newData);
}
