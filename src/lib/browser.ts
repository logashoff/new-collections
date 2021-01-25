export type QueryInfo = chrome.tabs.QueryInfo;
export type Tab = chrome.tabs.Tab;
export type TabIconDetails = chrome.browserAction.TabIconDetails;

/**
 * Returns tabs promise based on provided config.
 */
export function queryTabs(config: QueryInfo): Promise<Tab[]> {
  return new Promise((resolve) => chrome.tabs.query(config, (tabs) => resolve(tabs)));
}

/**
 * Returns active tab in current window.
 */
export function getActiveTab(): Promise<Tab> {
  return new Promise(async (resolve) => {
    const [activeTab] = await this.queryTabs({ active: true, currentWindow: true });
    resolve(activeTab);
  });
}

/**
 * Removes opened tab by specified tab ID.
 */
export function removeTab(tabId: number): Promise<void> {
  return new Promise((resolve) => {
    chrome.tabs.remove(tabId, () => resolve());
  });
}

/**
 * Returns true if browser uses dark theme.
 */
export function usesDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Replaces extension icon with specified details.
 */
export function setIcon(details: TabIconDetails): Promise<void> {
  return new Promise((resolve) => chrome.browserAction.setIcon(details, () => resolve()));
}
