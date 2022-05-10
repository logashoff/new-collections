import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { groupBy } from 'lodash';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import {
  BrowserTab,
  getHostname,
  getSavedTabs,
  GroupByTime,
  HostnameGroup,
  ignoreUrlsRegExp,
  saveTabGroups,
  Tab,
  TabGroup,
  Time,
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
  readonly tabGroups$ = this.tabGroupsSource$.pipe(
    map((res) => (res?.length > 0 ? res : null)),
    shareReplay(1)
  );

  /**
   * Loaded tab list.
   */
  private tabGroups: TabGroup[] = [];

  /**
   * Group icons by hostname and map each icons group to their `TabGroup`.
   */
  private readonly groupTabsByHostnameMap: { [groupId in string]: HostnameGroup } = {};

  /**
   * Behavior subject will be used to populate tabs data when managing tabs.
   */
  private readonly timeGroupLabelsSource$ = new BehaviorSubject<string[]>(null);

  /**
   * Observable used by components to listen for tabs data changes.
   */
  readonly timeGroupLabels$ = this.timeGroupLabelsSource$.pipe(
    map((labels) => (labels?.length > 0 ? labels : null)),
    shareReplay(1)
  );

  /**
   * Behavior subject will be used to populate tabs data when managing tabs.
   */
  private readonly groupsByTimeSource$ = new BehaviorSubject<GroupByTime>(null);

  /**
   * Observable used by components to listen for tabs data changes.
   */
  readonly groupsByTime$ = this.groupsByTimeSource$.pipe(shareReplay(1));

  constructor(private snackBar: MatSnackBar) {
    this.initService();
  }

  /**
   * Initialize service and load stored tab groups.
   */
  private async initService() {
    this.tabGroups = await getSavedTabs();

    this.tabGroups.forEach((group) => this.groupTabsByHostName(group));
    this.createTimeGroups(this.tabGroups);

    this.refresh();
  }

  /**
   * Generates icon group based on tab group specified.
   */
  private groupTabsByHostName(tabGroup: TabGroup) {
    const groupByHostname = groupBy(tabGroup.tabs, getHostname);
    const values = Object.values(groupByHostname);
    this.groupTabsByHostnameMap[tabGroup.id] = values.sort((a, b) => b.length - a.length);
  }

  /**
   * Creates timeline array and hashmap that maps each timeline item to groups by their timestamp.
   */
  private createTimeGroups(tabGroups: TabGroup[]) {
    const groupsByTime: GroupByTime = {};
    const timeGroupLabels = [];

    tabGroups.forEach((tabGroup) => {
      const timeLabel = this.getTimeLabel(tabGroup);
      if (!groupsByTime[timeLabel]) {
        timeGroupLabels.push(timeLabel);
        groupsByTime[timeLabel] = [];
      }

      groupsByTime[timeLabel].push(tabGroup);
    });

    this.groupsByTimeSource$.next(groupsByTime);
    this.timeGroupLabelsSource$.next(timeGroupLabels);
  }

  /**
   * Returns timeline label based on group timestamp.
   */
  private getTimeLabel(tabGroup: TabGroup): string {
    const { timestamp } = tabGroup;
    const now = new Date().getTime();
    const diff = now - timestamp;

    switch (true) {
      case diff < Time.Today:
        return 'Today';
      case diff > Time.Today && diff < Time.Day:
        return 'Yesterday';
      case diff > Time.Day && diff < Time.Week:
        return 'Week';
      case diff > Time.Week && diff < Time.Year:
        return moment(timestamp).format('MMMM');
      default:
        return moment(timestamp).format('MMMM YYYY');
    }
  }

  /**
   * Returns icons group by group specified.
   */
  getTabsGroupedByHostname(group: TabGroup): HostnameGroup {
    return this.groupTabsByHostnameMap[group.id];
  }

  /**
   * Generates tab group from browser tab list.
   */
  async createTabGroup(tabs: Tab[]): Promise<TabGroup> {
    return new Promise((resolve) => {
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

      const tabGroup: TabGroup = {
        id: uuidv4(),
        timestamp: new Date().getTime(),
        tabs: filteredTabs,
      };

      resolve(tabGroup);
    });
  }

  /**
   * Updates tab groups observable.
   */
  refresh() {
    this.tabGroupsSource$.next(this.tabGroups);
  }

  /**
   * Saves provided tab groups to local storage.
   */
  async saveTabGroups(tabGroups: TabGroup[]) {
    if (tabGroups?.length > 0) {
      if (!this.tabGroups) {
        this.tabGroups = tabGroups;
      } else {
        this.tabGroups.push(
          ...tabGroups.map((tabGroup) => {
            tabGroup.id = uuidv4();
            return tabGroup;
          })
        );
      }

      // sort by time
      this.tabGroups.sort((a, b) => b.timestamp - a.timestamp);
      this.createTimeGroups(this.tabGroups);

      tabGroups.forEach((tabGroup) => this.groupTabsByHostName(tabGroup));

      this.saveTabs();
      this.refresh();
    }
  }

  /**
   * Saves specified tab group to local storage.
   */
  async saveTabGroup(tabGroup: TabGroup) {
    if (!this.tabGroups) {
      this.tabGroups = [];
    }

    // merge saved and new tabs
    this.tabGroups.unshift(tabGroup);

    this.groupTabsByHostName(tabGroup);

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
        const removedTab = group.tabs.splice(tabIndex, 1)[0];

        if (group.tabs.length === 0) {
          this.removeTabGroup(group);
        } else {
          const hostnameGroups = this.getTabsGroupedByHostname(group);
          const hostnameGroupIndex = hostnameGroups?.findIndex((hostnameGroup) => {
            const index = hostnameGroup.findIndex((tab) => tab === removedTab);

            if (index > -1) {
              hostnameGroup.splice(index, 1);
              return true;
            }
          });

          if (hostnameGroupIndex > -1 && hostnameGroups[hostnameGroupIndex].length === 0) {
            hostnameGroups.splice(hostnameGroupIndex, 1);
          }
        }

        this.saveTabs();
      }
    }
  }

  /**
   * Removed specified tab group from local storage.
   */
  async removeTabGroup(tabGroup: TabGroup) {
    delete this.groupTabsByHostnameMap[tabGroup.id];

    const groupIndex = this.tabGroups.findIndex(({ id }) => id === tabGroup.id);

    if (groupIndex > -1) {
      this.tabGroups.splice(groupIndex, 1);

      const timeLabels = this.timeGroupLabelsSource$.value;
      const groupsByTime = this.groupsByTimeSource$.value;
      const timeLabel = timeLabels.find((label) => {
        const groups = groupsByTime[label];
        const i = groups.findIndex((group) => group === tabGroup);

        if (i > -1) {
          return groups.splice(i, 1).length > 0;
        }
      });

      // remove time label if all groups are removed
      if (groupsByTime[timeLabel]?.length === 0) {
        const i = timeLabels.findIndex((label) => label === timeLabel);
        timeLabels.splice(i, 1);
      }

      this.saveTabs();
    }

    if (this.tabGroups.length === 0) {
      this.tabGroupsSource$.next(null);
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
  displayMessage(
    message: string,
    action = 'Dismiss',
    config: MatSnackBarConfig = {}
  ): MatSnackBarRef<TextOnlySnackBar> {
    return this.snackBar.open(message, action, {
      ...config,
      verticalPosition: 'top',
      politeness: 'assertive',
    });
  }
}
