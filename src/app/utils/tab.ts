import { saveAs } from 'file-saver';
import selectFiles from 'select-files';
import { Collection, Collections, Tab, tabsStorageKey } from './models';

/**
 * Saves specified tab groups to local storage.
 */
export function saveTabGroups(collections: Collections): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [tabsStorageKey]: collections }, () => resolve());
  });
}

/**
 * Returns tab groups stored in local storage.
 */
export function getSavedTabs(): Promise<Collections> {
  return new Promise((resolve) => {
    chrome.storage.local.get(tabsStorageKey, ({ tabs }) => resolve(tabs));
  });
}

/**
 * Restores all tabs from specified tab group.
 */
export function restoreTabs(collection: Collection) {
  collection.tabs.forEach(({ url, active, pinned }) =>
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
  saveAs(blob, `save-tabs-${new Date().toISOString()}.json`);
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
export function hostname(url: string): string {
  return new URL(url).hostname;
}

/**
 * Returns hostname from tab's url
 */
export function getHostname(tab: Tab): string {
  return hostname(tab.url);
}
