import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { groupBy, remove } from 'lodash';
import moment from 'moment';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import {
  BrowserTab,
  getHostname,
  getSavedTabs,
  ignoreUrlsRegExp,
  saveTabGroups,
  Tab,
  TabGroup,
  TabsByHostname,
  Timeline,
  TimelineElement,
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
   * Group icons by hostname and map each icons group to their `TabGroup`.
   */
  readonly tabsByHostname$: Observable<TabsByHostname> = this.tabGroups$.pipe(
    map((tabGroups) => this.createHostnameGroups(tabGroups)),
    shareReplay(1)
  );

  /**
   * Groups timeline.
   */
  readonly groupsTimeline$: Observable<Timeline> = this.tabGroups$.pipe(
    map((tabGroups) => (tabGroups?.length > 0 ? this.createTimeline(tabGroups) : null)),
    shareReplay(1)
  );

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

  /**
   * Generates icon group based on tab group specified.
   */
  private createHostnameGroups(tabGroups: TabGroup[]): TabsByHostname {
    const ret: TabsByHostname = {};

    tabGroups.forEach((tabGroup) => {
      const groupByHostname = groupBy(tabGroup.tabs, getHostname);
      const values = Object.values(groupByHostname);
      ret[tabGroup.id] = values.sort((a, b) => b.length - a.length);
    });

    return ret;
  }

  /**
   * Creates timeline array and hashmap that maps each timeline item to groups by their timestamp.
   */
  private createTimeline(timelineItems: TimelineElement[]): Timeline {
    const timeline: Timeline = {};

    timelineItems.forEach((timelineItem) => {
      const timeLabel = this.getTimelineLabel(timelineItem);
      if (!timeline[timeLabel]) {
        timeline[timeLabel] = [];
      }

      timeline[timeLabel].push(timelineItem);
    });

    return timeline;
  }

  /**
   * Returns timeline label based on group timestamp.
   */
  private getTimelineLabel(timelineItem: TimelineElement): string {
    const { timestamp } = timelineItem;
    const date = moment(timestamp);
    const now = moment();

    switch (true) {
      case date.isSame(now, 'd'):
        return 'Today';
      case date.isSame(now.subtract(1, 'd'), 'd'):
        return 'Yesterday';
      case date.isSame(now, 'w'):
        return 'Week';
      case date.isSame(now, 'y'):
        return date.format('MMMM');
      default:
        return date.format('MMMM YYYY');
    }
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
   * Saves provided tab groups to local storage.
   */
  async saveTabGroups(tabGroups: TabGroup[]) {
    if (tabGroups?.length > 0) {
      const currentTabGroups = await firstValueFrom(this.tabGroups$);

      currentTabGroups.push(
        ...tabGroups.map((tabGroup) => {
          tabGroup.id = uuidv4();
          return tabGroup;
        })
      );

      // sort by time
      currentTabGroups.sort((a, b) => b.timestamp - a.timestamp);

      this.tabGroupsSource$.next(currentTabGroups);

      this.saveTabs();
    }
  }

  /**
   * Saves specified tab group to local storage.
   */
  async saveTabGroup(tabGroup: TabGroup) {
    const currentTabGroups = await firstValueFrom(this.tabGroups$);

    // merge saved and new tabs
    currentTabGroups.unshift(tabGroup);

    this.saveTabs();
  }

  /**
   * Removes tab from specified tab group.
   */
  async removeTab(tab: BrowserTab): Promise<boolean> {
    return new Promise(async (resolve) => {
      const currentTabGroups = await firstValueFrom(this.tabGroups$);

      const group = currentTabGroups.find((group) => group.tabs.includes(tab));

      if (group) {
        const removedTabs = remove(group.tabs, (t) => t === tab);

        if (group.tabs.length === 0) {
          this.removeTabGroup(group);
        } else if (removedTabs?.length > 0) {
          const [removedTab] = removedTabs;

          const tabsByHostname = await firstValueFrom(this.tabsByHostname$);

          const hostnameGroupedTabs = tabsByHostname[group.id];
          const hostnameGroup = hostnameGroupedTabs.find((groups) => groups.includes(removedTab));

          remove(hostnameGroup, (tab) => tab === removedTab);

          if (hostnameGroup?.length === 0) {
            remove(hostnameGroupedTabs, (groupedTabs) => groupedTabs === hostnameGroup);
          }
        }

        this.saveTabs();

        resolve(true);
      }

      resolve(false);
    });
  }

  /**
   * Removed specified tab group from local storage.
   */
  async removeTabGroup(tabGroup: TabGroup) {
    const tabsByHostname = await firstValueFrom(this.tabsByHostname$);

    delete tabsByHostname[tabGroup.id];

    const currentTabGroups = await firstValueFrom(this.tabGroups$);

    const groupIndex = currentTabGroups.findIndex(({ id }) => id === tabGroup.id);

    if (groupIndex > -1) {
      currentTabGroups.splice(groupIndex, 1);

      const timeline = await firstValueFrom(this.groupsTimeline$);

      for (const timelineLabel in timeline) {
        const timelineItems = timeline[timelineLabel];
        const removedItems = remove(timelineItems, (item) => item === tabGroup);

        if (removedItems?.length > 0) {
          if (timelineItems.length === 0) {
            delete timeline[timelineLabel];
          }

          break;
        }
      }

      this.saveTabs();
    }
  }

  /**
   * Save current tabs state to local storage.
   */
  async saveTabs(): Promise<void> {
    return await saveTabGroups(await firstValueFrom(this.tabGroups$));
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
