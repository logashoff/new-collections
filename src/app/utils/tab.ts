import { saveAs } from 'file-saver';
import { groupBy, keyBy } from 'lodash';
import selectFiles from 'select-files';
import { validate as uuidValidate } from 'uuid';
import {
  BrowserTabs,
  Collections,
  HostnameGroup,
  Settings,
  settingsStorageKey,
  SyncData,
  SyncTabs,
  Tab,
} from './models';

/**
 * Saves specified tab groups to local storage.
 */
export async function saveTabGroups(collections: Collections): Promise<void> {
  const syncData: SyncData = (await chrome.storage.sync.get()) ?? {};
  const collectionsById = keyBy(collections, 'id');

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
export const getSavedTabs = async (): Promise<Collections> => {
  const syncData: SyncData = await chrome.storage.sync.get();

  if (syncData) {
    const collections: Collections = Object.keys(syncData)
      .filter((groupId) => uuidValidate(groupId))
      .map((groupId) => ({
        id: groupId,
        timestamp: syncData[groupId][0],
        tabs: syncToTabs(syncData[groupId][1]),
      }));

    return collections;
  }
};

/**
 * Converts BrowserTabs to tabs structure used in sync storage.
 */
export function tabsToSync(tabs: BrowserTabs): SyncTabs {
  return tabs.map(({ id, url, favIconUrl, title, pinned, active }) => [id, url, favIconUrl, title, pinned, active]);
}

/**
 * Converts sync storage tabs to BrowserTabs.
 */
export function syncToTabs(sync: SyncTabs): BrowserTabs {
  return sync.map(([id, url, favIconUrl, title, pinned, active]) => ({
    id,
    url,
    favIconUrl,
    title,
    pinned,
    active,
  }));
}

/**
 * Returns saved settings.
 */
export const getSettings = async (): Promise<Settings> => {
  const storage = await chrome.storage.local.get(settingsStorageKey);
  return storage[settingsStorageKey];
};

/**
 * Restores all tabs from specified tab group.
 */
export function restoreTabs(tabs: BrowserTabs) {
  tabs.forEach(({ url, active, pinned }) =>
    chrome.tabs.create({
      active,
      pinned,
      url,
    })
  );
}

/**
 * Writes provided tab groups to JSON file.
 */
export function exportTabs(collections: Collections) {
  const blob = new Blob([JSON.stringify(collections, null, 2)], { type: 'text/json;charset=utf-8' });
  saveAs(blob, `home-collections-${new Date().toISOString()}.json`);
}

/**
 * Import tab groups JSON file from file system.
 */
export async function importCollections(): Promise<Collections> {
  return new Promise(async (resolve, reject) => {
    try {
      const files = await selectFiles({ accept: '.json', multiple: false });

      const reader = new FileReader();
      reader.readAsText(files[0], 'utf-8');

      reader.onload = ({ target: { result } }) => {
        resolve(JSON.parse(result as string));
      };
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Returns hostname from URL.
 */
export function getUrlHostname(url: string): string {
  return new URL(url).hostname;
}

export function getUrlOrigin(url: string): string {
  return new URL(url).origin;
}

/**
 * Returns hostname from tab's url
 */
export function getHostname(tab: Tab): string {
  return getUrlHostname(tab.url);
}

/**
 * Returns BrowserTab array grouped by hostnames
 */
export function getHostnameGroup(tabs: BrowserTabs): HostnameGroup {
  const groupByHostname = groupBy(tabs, getHostname);
  const values = Object.values(groupByHostname);
  return values.sort((a, b) => b.length - a.length);
}
