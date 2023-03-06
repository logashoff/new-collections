import { BrowserTabs, QueryInfo, TabIconDetails, Tabs } from './models';

/**
 * Returns tabs promise based on provided config.
 */
export function queryTabs(config: QueryInfo): Promise<Tabs> {
  return new Promise((resolve) => chrome.tabs.query(config, (tabs) => resolve(tabs)));
}

/**
 * Returns tab list from current window.
 */
export function queryCurrentWindow(): Promise<Tabs> {
  return queryTabs({ currentWindow: true });
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
  return new Promise((resolve) => chrome.action.setIcon(details, () => resolve()));
}

/**
 * Restores all tabs from specified tab group.
 */
export async function restoreTabs(tabs: BrowserTabs) {
  const createdTabs = await Promise.all(
    tabs.map(({ url, pinned }) =>
      chrome.tabs.create({
        pinned,
        url,
        active: false,
      })
    )
  );

  const nonPinnedTabs = createdTabs.filter(({ pinned }) => !pinned);
  if (nonPinnedTabs.length > 1) {
    chrome.tabs.group({
      tabIds: nonPinnedTabs.map(({ id }) => id),
    });
  }
}

/**
 * Returns favicon URL based on page URL provided.
 */
export function getFaviconUrl(favIconUrl: string, size = 32) {
  try {
    const url = new URL(chrome.runtime.getURL('_favicon'));

    url.searchParams.append('pageUrl', favIconUrl);
    url.searchParams.append('size', `${size}`);

    return url.href;
  } catch (e) {}
}
