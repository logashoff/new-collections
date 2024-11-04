import { isUndefined, keyBy } from 'lodash-es';
import { validate as uuidValidate } from 'uuid';

import {
  BrowserTabs,
  Collection,
  Collections,
  faviconStorageKey,
  FaviconSync,
  Settings,
  StorageArea,
  SyncData,
  SyncTabs,
} from './models';
import { getSettings, getUrlHost } from './utils';

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
    if (uuidValidate(groupId) && !(groupId in collectionsById)) {
      delete syncData[groupId];
      removeKeys.push(groupId);
    }
  }

  await storage.remove(removeKeys);

  delete syncData[faviconStorageKey];

  if (collections?.length > 0) {
    collections.forEach(({ tabs, timestamp, id }) => (syncData[id] = [timestamp, tabsToSync(tabs)]));

    const favicon: { [host: string]: string } = {};
    collections.forEach(({ tabs }) =>
      tabs.filter(({ favIconUrl }) => favIconUrl).forEach((tab) => (favicon[getUrlHost(tab.url)] = tab.favIconUrl))
    );

    return storage.set({
      [faviconStorageKey]: favicon,
      ...syncData,
    });
  }
}

export async function getFaviconStore(): Promise<{ [hostname: string]: string }> {
  const storage = await getStorage();
  const favicon = await storage.get(faviconStorageKey);
  return favicon[faviconStorageKey] ?? {};
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
      .filter((groupId) => uuidValidate(groupId))
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

  const sourceKeys = Object.keys(sourceData).filter((groupId) => uuidValidate(groupId));
  sourceKeys.forEach((key) => (newData[key] = sourceData[key]));
  await source.remove([faviconStorageKey, ...sourceKeys.map((key) => key)]);
  await target.set(newData);
}
