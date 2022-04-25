import { Injectable } from '@angular/core';
import { getDomainsFromTabs, getSavedTabs, queryTabs, removeTab, saveTabGroups, TabGroup } from '@lib';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

/**
 * URLs to ignore when saving tabs.
 */
export const ignoreUrlsRegExp = new RegExp('^(about:|chrome:|file:|wss:|ws:|chrome-extension:)');

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
    this.initService();
  }

  /**
   * Initialize service and load stored tab groups.
   */
  async initService() {
    const tabGroups = await getSavedTabs();
    this.tabGroupsSource$.next(tabGroups);
  }

  /**
   * Saves all tabs from current window.
   */
  async saveCurrentWindowTabs(): Promise<void> {
    const tabs = await queryTabs({ currentWindow: true });

    const filteredTabs = tabs.filter((tab) => !ignoreUrlsRegExp.test(tab.url))

    const tabGroup: TabGroup = {
      id: uuidv4(),
      timestamp: new Date().getTime(),
      tabs: filteredTabs,
      domains: getDomainsFromTabs(filteredTabs),
    };

    return this.saveTabGroup(tabGroup);
  }

  /**
   * Saves provided tab groups to local storage.
   */
  async saveTabGroups(tabGroups: TabGroup[]) {
    if (Array.isArray(tabGroups) && tabGroups.length) {
      let savedTabGroups: TabGroup[] = await getSavedTabs();

      if (!Array.isArray(saveTabGroups)) {
        savedTabGroups = [];
      }

      const allTabs: TabGroup[] = [...tabGroups, ...savedTabGroups].map((tabGroup) => {
        tabGroup.id = uuidv4();
        return tabGroup;
      });

      await saveTabGroups(allTabs);

      this.tabGroupsSource$.next(allTabs);
    }
  }

  /**
   * Saves specified tab group to local storage.
   */
  async saveTabGroup(tabGroup: TabGroup) {
    // get current tabs
    let savedTabGroups = await getSavedTabs();

    if (!Array.isArray(savedTabGroups)) {
      savedTabGroups = [];
    }

    // filter out invalid URLs
    tabGroup.tabs = tabGroup.tabs
      .map(({ id, url, title, favIconUrl }) => ({
        favIconUrl,
        id,
        title,
        url,
      }));

    if (tabGroup.tabs.length > 0) {
      // close all saved tabs
      tabGroup.tabs.forEach(({ id }) => removeTab(id));

      // merge saved and new tabs
      savedTabGroups = [tabGroup, ...savedTabGroups];

      await saveTabGroups(savedTabGroups);

      this.tabGroupsSource$.next(savedTabGroups);
    }
  }

  /**
   * Removed specified tab group from local storage.
   */
  async removeTabGroup(tabGroup: TabGroup) {
    let savedTabGroups = await getSavedTabs();

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
      await saveTabGroups(savedTabGroups);
      this.tabGroupsSource$.next(savedTabGroups);
    }
  }
}
