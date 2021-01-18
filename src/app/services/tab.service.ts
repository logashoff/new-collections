import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

import { ignoreUrlsRegExp } from '../models';

/**
 * Group that contains tabs and is saved to local storage.
 */
export interface TabGroup {
  id: string;
  timestamp: number;
  tabs: Pick<chrome.tabs.Tab, 'id' | 'url' | 'favIconUrl' | 'title'>[];
}

/**
 * @description
 *
 * Service for managing tabs.
 */
@Injectable({
  providedIn: 'root',
})
export class TabService {
  /**
   * Behavior subject will be used to populate tabs data when managing tabs.
   */
  private readonly tabGroupsSource$ = new BehaviorSubject<TabGroup[]>(null);

  /**
   * Observable used by components to listen for tabs data changes.
   */
  readonly tabGroups$ = this.tabGroupsSource$
    .asObservable()
    .pipe(map((res) => (!Array.isArray(res) || res.length === 0 ? null : res)));

  constructor() {
    this.getSavedTabs().then((tabGroups) => this.tabGroupsSource$.next(tabGroups));
  }

  private queryTabs(config: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> {
    return new Promise((resolve, reject) => chrome.tabs.query(config, (tabs) => resolve(tabs)));
  }

  private removeTab(tabId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.tabs.remove(tabId, () => resolve());
    });
  }

  private getActiveTab(): Promise<chrome.tabs.Tab> {
    return new Promise(async (resolve) => {
      const [activeTab] = await this.queryTabs({ active: true, currentWindow: true });
      resolve(activeTab);
    });
  }

  async saveCurrentWindowTabs(): Promise<void> {
    const tabs = await this.queryTabs({ currentWindow: true });
    const tabGroup = {
      id: uuidv4(),
      timestamp: new Date().getTime(),
      tabs,
    };

    return this.saveTabGroup(tabGroup);
  }

  private saveTabGroups(tabGroups: TabGroup[]): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ tabs: tabGroups }, () => resolve());
    });
  }

  restoreTabs(tabGroup: TabGroup) {
    tabGroup.tabs.forEach((tab) =>
      chrome.tabs.create({
        url: tab.url,
        active: false,
      })
    );
  }

  async saveTabGroup(tabGroup: TabGroup) {
    // get current tabs
    let savedTabGroups = await this.getSavedTabs();

    if (!Array.isArray(savedTabGroups)) {
      savedTabGroups = [];
    }

    // filter out invalid URLs
    tabGroup.tabs = tabGroup.tabs
      .filter((tab) => !ignoreUrlsRegExp.test(tab.url))
      .map(({ id, url, title, favIconUrl }) => ({
        favIconUrl,
        id,
        title,
        url,
      }));

    if (tabGroup.tabs.length > 0) {
      const { id: activeTabId } = await this.getActiveTab();

      // close all saved tabs except current one
      tabGroup.tabs.filter(({ id }) => id !== activeTabId).forEach(({ id }) => this.removeTab(id));

      // merge saved and new tabs
      savedTabGroups = [tabGroup, ...savedTabGroups];

      await this.saveTabGroups(savedTabGroups);

      this.tabGroupsSource$.next(savedTabGroups);
    }
  }

  private getSavedTabs(): Promise<TabGroup[]> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get('tabs', ({ tabs }) => resolve(tabs));
    });
  }

  async removeTabGroup(tabGroup: TabGroup) {
    let savedTabGroups = await this.getSavedTabs();

    if (!Array.isArray(savedTabGroups)) {
      savedTabGroups = [];
    }

    const { id } = tabGroup;
    let index = -1;
    for (let i = 0; i < savedTabGroups.length; i++) {
      if (savedTabGroups[i].id === id) {
        index = i;
        break;
      }
    }

    if (index > -1) {
      savedTabGroups.splice(index, 1);
      await this.saveTabGroups(savedTabGroups);
      this.tabGroupsSource$.next(savedTabGroups);
    }
  }
}
