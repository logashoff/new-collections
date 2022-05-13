/**
 * Storage key used to store tab groups in local storage.
 */
export const tabsStorageKey = 'tabs';

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
export type BrowserTab = Pick<chrome.tabs.Tab, 'id' | 'url' | 'favIconUrl' | 'title' | 'pinned' | 'active'>;

/**
 * Group that contains tabs and is saved to local storage.
 */
export interface TabGroup {
  id: string;
  timestamp: number;
  tabs: BrowserTab[];
}

export type HostnameGroup = BrowserTab[][];

/**
 * Maps hostname groups to tab group ID.
 */
export interface TabsByHostname {
  [groupId: string]: HostnameGroup;
}

/**
 * Action icons.
 */
export enum ActionIcons {
  Export = 'download',
  Import = 'file_upload',
  Options = 'settings',
  Save = 'collections_bookmark',
}

/**
 * Available actions within application.
 */
export enum Action {
  Export = 1,
  Import = 2,
  Options = 3,
  Save = 4,
}

/**
 * Common icon sizes.
 */
export type IconSize = 'small' | 'medium';

/**
 * Timeline-like element.
 */
export interface TimelineElement {
  timestamp: number;
}

/**
 * Group tab groups by time label in hashmap.
 */
export interface Timeline {
  [label: string]: TimelineElement[];
}


