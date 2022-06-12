import isUndefined from 'lodash/isUndefined';
import keyBy from 'lodash/keyBy';
import { validate as uuidValidate } from 'uuid';
import { BrowserTabs, Collection, Collections, Settings, StorageArea, SyncData, SyncTabs } from './models';
import { getSettings } from './utils';

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

  for (let groupId in syncData) {
    if (uuidValidate(groupId) && !(groupId in collectionsById)) {
      delete syncData[groupId];
      await storage.remove(groupId);
    }
  }

  if (collections?.length > 0) {
    collections.forEach(({ tabs, timestamp, id }) => (syncData[id] = [timestamp, tabsToSync(tabs)]));

    return storage.set(syncData);
  }
}

/**
 * Returns saved collections from storage.
 */
export const getCollections = async (): Promise<Collections> => {
  const storage = await getStorage();
  const syncData: SyncData = await storage.get();

  if (syncData) {
    const collections: Collections = Object.keys(syncData)
      .filter((groupId) => uuidValidate(groupId))
      .map((groupId) => ({
        id: groupId,
        timestamp: syncData[groupId][0],
        tabs: syncToTabs(syncData[groupId][1]),
      }));

    return collections.length > 0 ? collections : null;
  }
};

/**
 * Converts BrowserTabs to tabs structure used in storage.
 */
export function tabsToSync(tabs: BrowserTabs): SyncTabs {
  return tabs.map(({ id, url, favIconUrl, title, pinned }) => [id, url, favIconUrl, title, pinned]);
}

/**
 * Converts storage tabs to BrowserTabs.
 */
export function syncToTabs(sync: SyncTabs): BrowserTabs {
  return sync.map(([id, url, favIconUrl, title, pinned]) => ({
    id,
    url,
    favIconUrl,
    title,
    pinned,
  }));
}

/**
 * Copies source storage collection to target storage.
 */
export async function copyStorage(source: StorageArea, target: StorageArea) {
  const newData: SyncData = {};
  const sourceData: SyncData = await source.get();

  const sourceKeys = Object.keys(sourceData).filter((groupId) => uuidValidate(groupId));
  sourceKeys.forEach((key) => (newData[key] = sourceData[key]));
  await Promise.all(sourceKeys.map((key) => source.remove(key)));
  await target.set(newData);
}
