import type { BrowserTabs, QueryInfo, Tabs } from './models';
import { createUrl } from './utils';

/**
 * Returns tabs promise based on provided config.
 */
export const queryTabs = (config: QueryInfo): Promise<Tabs> => chrome.tabs.query(config);

/**
 * Returns tab list from current window.
 */
export const queryCurrentWindow = (): Promise<Tabs> => queryTabs({ currentWindow: true });

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

  if (createdTabs.length > 0) {
    const [{ id: tabId }] = createdTabs;

    const groupId = await chrome.tabs.group({
      tabIds: [tabId, ...createdTabs.splice(1).map(({ id }) => id)],
    });

    await chrome.tabGroups.update(groupId, {
      collapsed: false,
      title: label,
    });
  }
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
