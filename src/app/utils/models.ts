import { remove, unionBy } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';

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

export type QueryInfo = chrome.tabs.QueryInfo;
export type Tab = chrome.tabs.Tab;
export type Tabs = Tab[];
export type TabIconDetails = chrome.browserAction.TabIconDetails;

/**
 * Tab type.
 */
export type BrowserTab = Pick<chrome.tabs.Tab, 'id' | 'url' | 'favIconUrl' | 'title' | 'pinned' | 'active'>;

export type BrowserTabs = BrowserTab[];

export interface Collection {
  id: string;
  timestamp: number;
  tabs: BrowserTabs;
}

export type Collections = Collection[];

/**
 * Group that contains tabs and is saved to local storage.
 */
export class TabGroup {
  readonly id: string;
  readonly timestamp: number;

  private readonly tabsSource$ = new BehaviorSubject<BrowserTabs>(null);

  readonly tabs$: Observable<BrowserTabs> = this.tabsSource$.asObservable();

  get tabs(): BrowserTabs {
    return this.tabsSource$.value;
  }

  constructor({ id, timestamp, tabs }: Collection) {
    this.id = id;
    this.timestamp = timestamp;

    this.tabsSource$.next(tabs);
  }

  mergeTabs(tabs: BrowserTabs) {
    this.tabsSource$.next(unionBy(tabs, this.tabs, 'id'));
  }

  prepend(tabs: BrowserTabs) {
    this.tabs.unshift(...tabs);
    this.tabsSource$.next(this.tabs);
  }

  addTabAt(index: number, tab: BrowserTab) {
    this.tabs.splice(index, 0, tab);
    this.tabsSource$.next(this.tabs);
  }

  removeTabAt(index: number) {
    this.tabs.splice(index, 1);
    this.tabsSource$.next(this.tabs);
  }

  removeTabs(tabs: BrowserTabs) {
    remove(this.tabs, tab => tabs.includes(tab));
    this.tabsSource$.next(this.tabs);
  }
}

export type TabGroups = TabGroup[];

export type HostnameGroup = BrowserTabs[];

/**
 * Maps hostname groups to tab group ID.
 */
export interface TabsByHostname {
  [groupId: string]: HostnameGroup;
}

/**
 * Action icons.
 */
export enum ActionIcon {
  Export = 'save_alt',
  Import = 'file_upload',
  Options = 'open_in_new',
  Save = 'bookmark_add',
  Undo = 'undo',
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
