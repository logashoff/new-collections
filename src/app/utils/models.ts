/**
 * Storage key used to store tab groups in local storage.
 */
export const storageKey = 'tabs';

/**
 * Matches domain name.
 */
export const domainRegExp = new RegExp('([^.]*).([^.]*)$');

/**
 * URLs to ignore when saving tabs.
 */
export const ignoreUrlsRegExp = new RegExp('^(about:|chrome:|file:|wss:|ws:|chrome-extension:)');

/**
 * Tab type.
 */
export type BrowserTab = Pick<chrome.tabs.Tab, 'id' | 'url' | 'favIconUrl' | 'title'>;

/**
 * Unique domains in tab group.
 */
export interface Domain {
  name: string;
  icon: string;
  count: number;
}

/**
 * Group that contains tabs and is saved to local storage.
 */
export interface TabGroup {
  id: string;
  timestamp: number;
  tabs: BrowserTab[];
  domains: Domain[];
}
