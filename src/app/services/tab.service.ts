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
    map((res) => (res?.length > 0 ? res.sort((a, b) => b.timestamp - a.timestamp) : null)),
    shareReplay(1)
  );

  /**
   * Group icons by hostname and map each icons group to their `TabGroup`.
   */
  readonly tabsByHostname$: Observable<TabsByHostname> = this.tabGroups$.pipe(
    map((tabGroups) => (tabGroups?.length > 0 ? this.createHostnameGroups(tabGroups) : null)),
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
    this.tabGroupsSource$.next(await getSavedTabs());
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
  async addTabGroups(tabGroups: TabGroup[]) {
    if (tabGroups?.length > 0) {
      const currentTabGroups = await firstValueFrom(this.tabGroups$);

      const newTabGroups: TabGroup[] = [
        ...currentTabGroups,
        ...tabGroups.map((tabGroup) => {
          tabGroup.id = uuidv4();
          return tabGroup;
        }),
      ];

      this.tabGroupsSource$.next(newTabGroups);

      this.save();
    }
  }

  /**
   * Saves specified tab group to local storage.
   */
  async addTabGroup(tabGroup: TabGroup) {
    const tabGroups = await firstValueFrom(this.tabGroups$);

    // merge saved and new tabs
    tabGroups.unshift(tabGroup);

    this.save();
  }

  /**
   * Removes tab from specified tab group.
   */
  async removeTab(tab: BrowserTab): Promise<boolean> {
    return new Promise(async (resolve) => {
      const tabGroups = await firstValueFrom(this.tabGroups$);

      const tabGroup = tabGroups.find((group) => group.tabs.includes(tab));

      if (tabGroup) {
        const removedTabs = remove(tabGroup.tabs, (t) => t === tab);
        let removedGroups = [];

        if (tabGroup.tabs.length === 0) {
          removedGroups = remove(tabGroups, (tg) => tg === tabGroup);
        }

        if (removedTabs?.length > 0 || removedGroups?.length > 0) {
          this.tabGroupsSource$.next(tabGroups);
          this.save();
          resolve(true);
        }
      }

      resolve(false);
    });
  }

  /**
   * Removed specified tab group from local storage.
   */
  async removeTabGroup(tabGroup: TabGroup) {
    const tabGroups = await firstValueFrom(this.tabGroups$);

    remove(tabGroups, (tg) => tg === tabGroup);

    this.tabGroupsSource$.next(tabGroups);
    this.save();
  }

  /**
   * Save current tabs state to local storage.
   */
  async save(): Promise<void> {
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
