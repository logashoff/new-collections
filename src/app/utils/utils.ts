import groupBy from 'lodash/groupBy';
import { getHostname } from './collections';
import { BrowserTabs, HostnameGroup, Settings, settingsStorageKey } from './models';

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
