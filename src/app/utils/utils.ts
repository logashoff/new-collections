import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import groupBy from 'lodash/groupBy';
import { BrowserTabs, HostnameGroup, Settings, settingsStorageKey, Tab } from './models';

/**
 * Returns BrowserTab array grouped by hostnames
 */
export function getHostnameGroup(tabs: BrowserTabs): HostnameGroup {
  const groupByHostname = groupBy(tabs, getHost);
  const values = Object.values(groupByHostname);
  return values;
}

/**
 * Returns saved settings.
 */
export const getSettings = async (): Promise<Settings> => {
  const storage = await chrome.storage.local.get(settingsStorageKey);
  return storage[settingsStorageKey];
};

/**
 * Returns hostname from URL.
 */
export function getUrlHostname(url: string): string {
  return new URL(url).hostname;
}

/**
 * Returns host from URL.
 */
export function getUrlHost(url: string): string {
  return new URL(url).host;
}

/**
 * Returns hostname from tab's url
 */
export function getHostname(tab: Tab): string {
  return getUrlHostname(tab.url);
}

/**
 * Returns host from tab's url
 */
export function getHost(tab: Tab): string {
  return getUrlHost(tab.url);
}

/**
 * Utility function for TranslateService `instant` method
 *
 * @returns Passthrough function for `instant` method
 */
export const translate = () => {
  const translate = inject(TranslateService);
  return (key: string | string[], interpolateParams?: Object): string => translate.instant(key, interpolateParams);
};

/**
 * Navigates to options page.
 */
export const openOptions = () => chrome.runtime.openOptionsPage();
