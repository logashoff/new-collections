import groupBy from 'lodash/groupBy';
import { from, Observable } from 'rxjs';
import scrollIntoView from 'scroll-into-view';
import { BrowserTabs, HostnameGroup, Settings, settingsStorageKey, Tab } from './models';

/**
 * Returns BrowserTab array grouped by hostnames
 */
export function getHostnameGroup(tabs: BrowserTabs): HostnameGroup {
  const groupByHostname = groupBy(tabs, getHostname);
  const values = Object.values(groupByHostname);
  return values.sort((a, b) => b.length - a.length);
}

/**
 * Returns saved settings.
 */
export const getSettings = async (): Promise<Settings> => {
  const storage = await chrome.storage.local.get(settingsStorageKey);
  return storage[settingsStorageKey];
};

/**
 * Scrolls specified element into view.
 */
export const scrollToElement = (element: any): Observable<unknown> =>
  from(
    new Promise((resolve) =>
      scrollIntoView(
        element,
        {
          time: 500,
        },
        resolve
      )
    )
  );

/**
 * Returns hostname from URL.
 */
export function getUrlHostname(url: string): string {
  return new URL(url).hostname;
}

/**
 * Get origin from URL
 */
export function getUrlOrigin(url: string): string {
  return new URL(url).origin;
}

/**
 * Returns hostname from tab's url
 */
export function getHostname(tab: Tab): string {
  return getUrlHostname(tab.url);
}
