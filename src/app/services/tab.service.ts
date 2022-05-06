import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  BrowserTab,
  getDomainsFromTabs,
  getSavedTabs,
  ignoreUrlsRegExp,
  removeTab,
  saveTabGroups,
  Tab,
  TabGroup,
} from 'src/app/utils';
import { v4 as uuidv4 } from 'uuid';

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

  /**
   * Loaded tab list.
   */
  private tabGroups: TabGroup[] = [];

  constructor(private snackBar: MatSnackBar) {
    this.initService();
  }

  /**
   * Initialize service and load stored tab groups.
   */
  private async initService() {
    this.tabGroups = await getSavedTabs();
    this.tabGroupsSource$.next(this.tabGroups);
  }

  async getTabGroup(tabs: Tab[]): Promise<TabGroup> {
    const filteredTabs = tabs
      .filter((tab) => !ignoreUrlsRegExp.test(tab.url))
      .map(({ id, url, title, favIconUrl, active, pinned }) => ({
        active,
        favIconUrl,
        id,
        pinned,
        title,
        url,
      }));

    return new Promise((resolve) => {
      if (filteredTabs?.length > 0) {
        const tabGroup: TabGroup = {
          id: uuidv4(),
          timestamp: new Date().getTime(),
          tabs: filteredTabs,
          domains: getDomainsFromTabs(filteredTabs),
        };

        resolve(tabGroup);
      }
    });
  }

  /**
   * Saves provided tab groups to local storage.
   */
  async saveTabGroups(tabGroups: TabGroup[]) {
    if (tabGroups?.length > 0) {
      this.tabGroups.unshift(
        ...tabGroups.map((tabGroup) => {
          tabGroup.id = uuidv4();
          return tabGroup;
        })
      );

      this.saveTabs();
    }
  }

  /**
   * Saves specified tab group to local storage.
   */
  async saveTabGroup(tabGroup: TabGroup) {
    // close all browser tabs from tab group
    tabGroup.tabs.forEach(({ id }) => removeTab(id));

    // merge saved and new tabs
    this.tabGroups.unshift(tabGroup);

    this.saveTabs();
  }

  /**
   * Removes tab from specified tab group.
   */
  async removeTab(groupId: string, tab: BrowserTab) {
    const groupIndex = this.tabGroups.findIndex((group) => group.id === groupId);

    if (groupIndex > -1) {
      const group = this.tabGroups[groupIndex];
      const tabIndex = group.tabs.findIndex(({ id }) => id === tab.id);

      if (tabIndex > -1) {
        group.tabs.splice(tabIndex, 1);

        if (group.tabs.length === 0) {
          this.tabGroups.splice(groupIndex, 1);
        } else {
          group.domains = getDomainsFromTabs(group.tabs);
        }

        this.saveTabs();
      }
    }
  }

  /**
   * Removed specified tab group from local storage.
   */
  async removeTabGroup(tabGroup: TabGroup) {
    const groupIndex = this.tabGroups.findIndex(({ id }) => id === tabGroup.id);

    if (groupIndex > -1) {
      this.tabGroups.splice(groupIndex, 1);

      this.saveTabs();
    }
  }

  /**
   * Save current tabs state to local storage.
   */
  async saveTabs(): Promise<void> {
    return await saveTabGroups(this.tabGroups);
  }

  /**
   * Displays snackbar message.
   */
  displayMessage(message: string) {
    this.snackBar.open(message, 'Dismiss', {
      verticalPosition: 'top',
      politeness: 'assertive',
    });
  }
}
