import { inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DateArg, format } from 'date-fns';
import { groupBy } from 'lodash-es';
import normalizeUrl from 'normalize-url';

import { BrowserTabs, HostnameGroup, LocaleMessage, Settings, settingsStorageKey, Tab, UUID } from './models';

/**
 * Regex to validate UUID
 */
export const uuidRegExp = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', 'i');

/**
 * Returns BrowserTab array grouped by hostnames
 */
export function getHostnameGroup(tabs: BrowserTabs): HostnameGroup {
  const groupByHostname = groupBy(tabs, getHost);
  return Object.values(groupByHostname);
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
 * Navigates to options page.
 */
export const openOptions = () => chrome.runtime.openOptionsPage();

/**
 * Saves specified data to a file
 */
export const saveFile = (blob: Blob, fileName: string) => {
  const url = self.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.click();

  self.URL.revokeObjectURL(url);
};

/**
 * Opens dialog to select JSON file
 */
export const selectFile = () =>
  new Promise((resolve) => {
    let input = document.createElement('input');
    const onSelect = () => {
      resolve(input.files || null);
      input.removeEventListener('change', onSelect);
      input = null;
    };

    input.type = 'file';
    input.accept = '.json';
    input.multiple = false;

    input.addEventListener('change', onSelect);

    setTimeout(() => input.click());
  });

export const scrollTop = (
  scrollOptions: ScrollToOptions = {
    top: 0,
    behavior: 'smooth',
  }
) => {
  document.body.scrollTo(scrollOptions);
};

/**
 * Creates path relative to extension URL
 *
 * @param path Path to asset
 * @returns Full path including extension URL
 */
export const createUrl = (path: string) => chrome.runtime.getURL(path);

/**
 * Return function to sanitize HTML in a specified value.
 */
export const sanitizeHtml = () => {
  const sanitizer = inject(DomSanitizer);
  return (value: string): SafeHtml => sanitizer.bypassSecurityTrustHtml(value);
};

/**
 * Gets the localized string for the specified message. If the message is missing,
 * this method returns an empty string ('').
 *
 * @param messageName The name of the message, as specified in the messages.json file.
 * @param substitutions Optional. Up to 9 substitution strings, if the message requires any.
 */
export const translate = (messageName: LocaleMessage, substitutions?: string | string[]): string =>
  chrome.i18n.getMessage(messageName, substitutions);

/**
 * Resolves promise when timeout is completed.
 */
export const sleep = (timeout: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, timeout));

export const uuid = () => self.crypto.randomUUID();

export const isUuid = (uuid: UUID) => uuidRegExp.test(uuid);

export const getNormalizedUrl = (url: string) =>
  normalizeUrl(url, {
    removeSingleSlash: true,
    removeTrailingSlash: true,
    stripAuthentication: true,
    stripProtocol: true,
    stripWWW: true,
  });

export const formatDate = (value: DateArg<Date>, formatStr = 'PP') => {
  if (typeof value === 'number') {
    value = Math.abs(value);
  }

  return format(value, formatStr);
};
