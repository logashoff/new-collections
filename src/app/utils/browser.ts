import { BrowserTabs, QueryInfo, Tabs } from './models';
import { createUrl } from './utils';

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
 * Restores all tabs from specified tab list.
 *
 * @param tabs Tabs to create tab group for.
 * @param label Tab group label.
 */
export async function restoreTabs(tabs: BrowserTabs, label?: string) {
  const createdTabs = await Promise.all(
    tabs.map(({ url }) =>
      chrome.tabs.create({
        url,
        active: false,
      })
    )
  );

  const groupId = await chrome.tabs.group({
    tabIds: createdTabs.map(({ id }) => id),
  });

  chrome.tabGroups.update(groupId, {
    collapsed: true,
    title: label,
  });
}

/**
 * Returns favicon URL based on page URL provided.
 */
export function getFaviconUrl(favIconUrl: string, size = 32) {
  try {
    const url = new URL(createUrl('_favicon'));

    url.searchParams.append('pageUrl', favIconUrl);
    url.searchParams.append('size', `${size}`);

    return url.href;
  } catch (e) {}
}
