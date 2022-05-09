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
 * Icons used by main menu.
 */
export enum ActionIcons {
  Export = 'download',
  Import = 'file_upload',
  Options = 'settings',
  Save = 'collections_bookmark',
}

/**
 * Main menu action IDs.
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
 * Time in milliseconds.
 */
export enum Time {
  Today = 86_400_000,
  Day = 172_800_000,
  Week = 604_800_000,
  Month = 2_592_000_000,
  Year = 31_536_000_000,
}

/**
 * Group tab groups by time label in hashmap.
 */
export type GroupByTime = { [timeLabel in string]: TabGroup[] };
