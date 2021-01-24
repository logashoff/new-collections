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
