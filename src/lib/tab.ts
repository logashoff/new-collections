import { saveAs } from 'file-saver';
import selectFiles from 'select-files';
import { v4 as uuidv4 } from 'uuid';

/**
 * Storage key used to store tab groups in local storage.
 */
export const storageKey = 'tabs';

/**
 * Group that contains tabs and is saved to local storage.
 */
export interface TabGroup {
  id: string;
  timestamp: number;
  tabs: Pick<chrome.tabs.Tab, 'id' | 'url' | 'favIconUrl' | 'title'>[];
}

/**
 * Saves specified tab groups to local storage.
 */
export function saveTabGroups(tabGroups: TabGroup[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [storageKey]: tabGroups }, () => resolve());
  });
}

/**
 * Returns tab groups stored in local storage.
 */
export function getSavedTabs(): Promise<TabGroup[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(storageKey, ({ tabs }) => resolve(tabs));
  });
}

/**
 * Restores all tabs from specified tab group.
 */
export function restoreTabs(tabGroup: TabGroup) {
  tabGroup.tabs.forEach((tab) =>
    chrome.tabs.create({
      url: tab.url,
      active: false,
    })
  );
}

/**
 * Writes provided tab groups to JSON file.
 */
export function exportTabs(tabGroup: TabGroup[]) {
  const blob = new Blob([JSON.stringify(tabGroup, null, 2)], { type: 'text/json;charset=utf-8' });
  saveAs(blob, `save-tabs-${uuidv4()}.json`);
}

/**
 * Import tab groups JSON file from file system.
 */
export async function importTabs(): Promise<TabGroup[]> {
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
