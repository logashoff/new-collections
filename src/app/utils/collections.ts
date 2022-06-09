import keyBy from 'lodash/keyBy';
import { validate as uuidValidate } from 'uuid';
import { BrowserTabs, Collection, Collections, SyncData, SyncTabs } from './models';

/**
 * Saves specified tab groups to local storage.
 */
export async function saveCollections(collections: Collections): Promise<void> {
  const syncData: SyncData = (await chrome.storage.sync.get()) ?? {};
  const collectionsById: { [id: string]: Collection } = keyBy(collections, 'id');

  for (let groupId in syncData) {
    if (uuidValidate(groupId) && !(groupId in collectionsById)) {
      delete syncData[groupId];
      await chrome.storage.sync.remove(groupId);
    }
  }

  if (collections?.length > 0) {
    collections.forEach(({ tabs, timestamp, id }) => (syncData[id] = [timestamp, tabsToSync(tabs)]));

    return chrome.storage.sync.set(syncData);
  }
}

/**
 * Returns tab groups stored in local storage.
 */
export const getCollections = async (): Promise<Collections> => {
  const syncData: SyncData = await chrome.storage.sync.get();

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
 * Converts BrowserTabs to tabs structure used in sync storage.
 */
export function tabsToSync(tabs: BrowserTabs): SyncTabs {
  return tabs.map(({ id, url, favIconUrl, title, pinned }) => [id, url, favIconUrl, title, pinned]);
}

/**
 * Converts sync storage tabs to BrowserTabs.
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
