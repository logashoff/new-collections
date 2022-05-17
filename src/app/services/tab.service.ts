import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { groupBy, keyBy, remove, unionBy } from 'lodash';
import moment from 'moment';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import {
  ActionIcon,
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
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { MessageComponent } from '../modules/shared';

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

  /**
   * Group ID set by URL query params
   */
  readonly paramsGroupId$: Observable<string> = this.activeRoute.queryParams.pipe(
    map((params) => params.groupId),
    shareReplay(1)
  );

  /**
   * Group ID set by URL query params
   */
  readonly paramsTabId$: Observable<number> = this.activeRoute.queryParams.pipe(
    map((params) => params.tabId),
    shareReplay(1)
  );

  constructor(private snackBar: MatSnackBar, private activeRoute: ActivatedRoute) {
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
      const filteredTabs: BrowserTab[] = tabs
        .filter((tab) => !ignoreUrlsRegExp.test(tab.url))
        .map(
          ({ id, url, title, favIconUrl, active, pinned }): BrowserTab => ({
            active,
            favIconUrl,
            id,
            pinned,
            title,
            url,
          })
        );

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

      const newTabGroups: TabGroup[] = currentTabGroups ?? [];
      const currentGroupsMap = keyBy(newTabGroups, 'id');

      tabGroups.forEach((newGroup) => {
        const currentGroup = currentGroupsMap[newGroup.id];
        if (currentGroup) {
          currentGroup.tabs = unionBy(newGroup.tabs, currentGroup.tabs, 'id');
        } else if (uuidValidate(newGroup.id) && newGroup.timestamp && newGroup.tabs?.length > 0) {
          newTabGroups.push(newGroup);
        }
      });

      this.tabGroupsSource$.next(newTabGroups);

      this.save();
    }
  }

  /**
   * Saves specified tab group to local storage.
   */
  async addTabGroup(tabGroup: TabGroup) {
    let tabGroups = await firstValueFrom(this.tabGroups$);

    tabGroups = tabGroups ?? [];
    const groupsMap = keyBy(tabGroups, 'id');

    const existingGroup = groupsMap[tabGroup.id];
    if (existingGroup) {
      existingGroup.tabs = unionBy(tabGroup.tabs, existingGroup.tabs, 'id');
    } else {
      tabGroups.push(tabGroup);
    }

    this.tabGroupsSource$.next(tabGroups);

    this.save();
  }

  /**
   * Removes tab from specified tab group.
   */
  async removeTab(removedTab: BrowserTab): Promise<MatSnackBarRef<MessageComponent>> {
    return new Promise(async (resolve) => {
      let messageRef: MatSnackBarRef<MessageComponent>;

      const tabGroups = await firstValueFrom(this.tabGroups$);
      const tabGroup = await this.getGroupByTab(removedTab);

      let removeIndex = -1;

      if (tabGroup) {
        removeIndex = tabGroup.tabs.findIndex((tab) => tab === removedTab);

        if (removeIndex > -1) {
          tabGroup.tabs.splice(removeIndex, 1);

          if (tabGroup.tabs.length === 0) {
            messageRef = await this.removeTabGroup(tabGroup);
          } else if (removeIndex > -1) {
            this.tabGroupsSource$.next(tabGroups);
            this.save();
            messageRef = this.displayMessage('Item removed', ActionIcon.Undo);
          }
        }
      }

      resolve(messageRef);

      if (removeIndex > -1) {
        const { dismissedByAction: revert } = await lastValueFrom(messageRef.afterDismissed());

        if (revert) {
          tabGroup.tabs.splice(removeIndex, 0, removedTab);
          this.tabGroupsSource$.next(tabGroups);
          this.save();
        }
      }
    });
  }

  /**
   * Returns group that specified tab belongs to.
   */
  async getGroupByTab(tab: BrowserTab): Promise<TabGroup> {
    const tabGroups = await firstValueFrom(this.tabGroups$);

    return tabGroups.find((group) => group.tabs.includes(tab));
  }

  /**
   * Removed specified tab group from local storage.
   */
  async removeTabGroup(tabGroup: TabGroup): Promise<MatSnackBarRef<MessageComponent>> {
    return new Promise(async (resolve) => {
      const tabGroups = await firstValueFrom(this.tabGroups$);
      const messageRef = this.displayMessage('Item removed', ActionIcon.Undo);

      const removedGroups = remove(tabGroups, (tg) => tg === tabGroup);

      this.tabGroupsSource$.next(tabGroups);

      resolve(messageRef);

      this.save();

      if (removedGroups?.length > 0) {
        const { dismissedByAction: revert } = await lastValueFrom(messageRef.afterDismissed());

        if (revert) {
          await this.addTabGroup(tabGroup);
        }
      }
    });
  }

  /**
   * Removed multiple tab groups.
   */
  async removeTabGroups(tabGroups: TabGroup[]): Promise<MatSnackBarRef<MessageComponent>> {
    return new Promise(async (resolve) => {
      const currentTabGroups = await firstValueFrom(this.tabGroups$);
      const messageRef = this.displayMessage('Items removed', ActionIcon.Undo);

      const removedGroups = remove(currentTabGroups, (tabGroup) => tabGroups.includes(tabGroup));

      if (removedGroups?.length > 0) {
        this.tabGroupsSource$.next(currentTabGroups);

        resolve(messageRef);

        this.save();

        if (removedGroups?.length > 0) {
          const { dismissedByAction: revert } = await lastValueFrom(messageRef.afterDismissed());

          if (revert) {
            await this.addTabGroups(removedGroups);
          }
        }
      }
    });
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
  displayMessage(message: string, actionIcon?: ActionIcon, config: MatSnackBarConfig = {}) {
    return this.snackBar.openFromComponent(MessageComponent, {
      duration: 10_000,
      ...config,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: 'message-container',
      data: {
        actionIcon,
        message,
      },
    });
  }
}
