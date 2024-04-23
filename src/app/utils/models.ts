import { ThemePalette } from '@angular/material/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { SafeUrl } from '@angular/platform-browser';
import { keyBy, remove } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';
import { MessageComponent } from '../modules/shared';

/**
 * Local storage key for saving app settings
 */
export const settingsStorageKey = 'settings';

/**
 * Storage key to store tabs favicon URLs by hostname in separate object
 */
export const faviconStorageKey = 'favicon';

/**
 * URLs to ignore when saving tabs.
 */
export const ignoreUrlsRegExp = new RegExp('^(about:|chrome:|file:|wss:|ws:|chrome-extension:)');

export type QueryInfo = chrome.tabs.QueryInfo;
export type Tab = chrome.tabs.Tab;
export type Tabs = Tab[];
export type Device = chrome.sessions.Device;
export type MostVisitedURL = chrome.topSites.MostVisitedURL;
export type StorageArea = chrome.storage.StorageArea;
export type Session = chrome.sessions.Session;
export type Sessions = Session[];
export type Devices = Device[];
export type TopSite = MostVisitedURL;
export type TopSites = TopSite[];
export type MessageRef = MatSnackBarRef<MessageComponent>;
export type ImageSource = string | SafeUrl;

/**
 * Checks if group should be expanded by group ID
 */
export type GroupExpanded = { [groupId: string]: boolean };

/**
 * Checks if panel group is expanded by URL
 */
export type ExpandedGroupsByUrl = { [url: string]: GroupExpanded };

export interface TabDelete {
  deletedTab: BrowserTab;
  revertDelete: MessageRef;
}

/**
 * App settings config
 */
export interface Settings {
  enableDevices?: boolean;
  enableTopSites?: boolean;
  ignoreTopSites?: MostVisitedURL[];
  syncStorage?: boolean;
  panels?: ExpandedGroupsByUrl;
}

/**
 * BrowserTab structure used in storing in sync storage
 */
export type SyncTab = [id: number, url: string, title: string];
export type SyncTabs = SyncTab[];

/**
 * Data used to store collections in sync storage
 */
export interface SyncData {
  /**
   * Map group ID to array containing group timestamp and tabs
   */
  [groupId: string]: [timestamp: number, tabs: SyncTabs];
}

/**
 * Storage change event
 */
export type StorageChanges = { [key: string]: chrome.storage.StorageChange };

/**
 * Tab type.
 */
export type BrowserTab = Pick<chrome.tabs.Tab, 'id' | 'url' | 'favIconUrl' | 'title'>;

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
export class TabGroup implements Collection {
  readonly id: string;

  #timestamp: number;

  /**
   * Time when group was created
   */
  get timestamp(): number {
    return this.#timestamp;
  }

  set timestamp(value: number) {
    this.#timestamp = value;
  }

  private readonly tabsSource$ = new BehaviorSubject<BrowserTabs>(null);

  readonly tabs$: Observable<BrowserTabs> = this.tabsSource$.asObservable();

  get tabs(): BrowserTabs {
    return this.tabsSource$.value;
  }

  constructor({ id, timestamp, tabs }: Collection) {
    this.id = id;
    this.#timestamp = timestamp;

    this.tabsSource$.next(tabs);
  }

  /**
   * Toggles timestamp positive to negative.
   * Negative timestamp value means tab group is pinned.
   */
  favToggle() {
    this.#timestamp *= -1;
  }

  /**
   * Merges current tabs list with provided one.
   *
   * @param tabs New tab list.
   * @param sync True if current tabs should be removed if not in new list.
   */
  mergeTabs(tabs: BrowserTabs, sync = false) {
    const currTabsById = keyBy(this.tabs, 'id');

    if (sync) {
      const newTabsById = keyBy(tabs, 'id');
      remove(this.tabs, ({ id }) => !(id in newTabsById));
    }

    tabs?.forEach((newTab, index) => {
      if (!(newTab.id in currTabsById)) {
        this.tabs.splice(index, 0, newTab);
      } else {
        const currTab = currTabsById[newTab.id];
        currTab.favIconUrl = newTab.favIconUrl;
        currTab.title = newTab.title;
        currTab.url = newTab.url;
      }
    });

    this.tabsSource$.next(this.tabs);
  }

  updateTab(tab: BrowserTab, updatedTab: BrowserTab): BrowserTab {
    const index = this.tabs.findIndex((t) => t === tab);

    if (index > -1) {
      const mergeTab: BrowserTab = {
        ...tab,
        ...updatedTab,
      };

      this.tabs.splice(index, 1, mergeTab);

      this.tabsSource$.next(this.tabs);

      return mergeTab;
    }
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
    remove(this.tabs, (tab) => tabs.includes(tab));
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
  Save = 'bookmark_add',
  Settings = 'settings',
  Undo = 'undo',
}

/**
 * Available actions within application.
 */
export enum Action {
  Export = 1,
  Import = 2,
  Settings = 3,
  Save = 4,
}

/**
 * Collection Action
 */
export interface CollectionAction {
  action: Action;
  icon?: ActionIcon;
  tooltip?: string;
  color?: ThemePalette;
  label?: string;
}

export type CollectionActions = CollectionAction[];

/**
 * Common icon sizes.
 */
export type IconSize = 'small' | 'medium' | 'large';

/**
 * Timeline-like element.
 */
export interface TimelineElement {
  label: string;
  elements: TabGroups;
}

/**
 * Group tab groups by time label in hashmap.
 */
export type Timeline = TimelineElement[];
