import { groupBy } from 'lodash-es';
import { BrowserTabs, HostnameGroup, Settings, settingsStorageKey, Tab } from './models';
import { inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
 * Navigates to options page.
 */
export const openOptions = () => chrome.runtime.openOptionsPage();

/**
 * Saves specified data to a file
 */
export const saveFile = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.click();

  window.URL.revokeObjectURL(url);
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
export const translate = (messageName: string, substitutions?: string | string[]): string =>
  chrome.i18n.getMessage(messageName, substitutions);
