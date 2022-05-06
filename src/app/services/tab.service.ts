import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
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

  constructor(private snackBar: MatSnackBar) {
    this.initService();
  }

  /**
   * Initialize service and load stored tab groups.
   */
  private async initService() {
    const tabGroups = await getSavedTabs();
    this.tabGroupsSource$.next(tabGroups);
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

    return new Promise((resolve, reject) => {
      if (filteredTabs?.length > 0) {
        const tabGroup: TabGroup = {
          id: uuidv4(),
          timestamp: new Date().getTime(),
          tabs: filteredTabs,
          domains: getDomainsFromTabs(filteredTabs),
        };

        resolve(tabGroup);
      } else {
        reject('Opened tabs cannot be saved');
      }
    });
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

    // close all browser tabs from tab group
    tabGroup.tabs.forEach(({ id }) => removeTab(id));

    // merge saved and new tabs
    savedTabGroups = [tabGroup, ...(savedTabGroups || [])];

    await saveTabGroups(savedTabGroups);

    this.tabGroupsSource$.next(savedTabGroups);
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
