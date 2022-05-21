import { Injectable } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';
import { groupBy, keyBy, remove } from 'lodash';
import moment from 'moment';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import {
  ActionIcon,
  BrowserTab,
  BrowserTabs,
  Collection,
  getHostname,
  getSavedTabs,
  ignoreUrlsRegExp,
  saveTabGroups,
  TabGroup,
  TabGroups,
  Tabs,
  TabsByHostname,
  Timeline,
  TimelineElement
} from 'src/app/utils';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { MessageComponent, TabsSelectorComponent } from '../modules/shared';
import { NavService } from './nav.service';

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
  private readonly tabGroupsSource$ = new BehaviorSubject<TabGroups>(null);

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

  constructor(private snackBar: MatSnackBar, private bottomSheet: MatBottomSheet, private navService: NavService) {
    this.initService();
  }

  /**
   * Initialize service and load stored tab groups.
   */
  private async initService() {
    const collections = await getSavedTabs();
    this.tabGroupsSource$.next(collections?.map((collection) => new TabGroup(collection)));
  }

  /**
   * Generates icon group based on tab group specified.
   */
  private createHostnameGroups(tabGroups: TabGroups): TabsByHostname {
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
  async createTabGroup(tabs: Tabs): Promise<TabGroup> {
    return new Promise((resolve) => {
      const filteredTabs: BrowserTabs = tabs
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

      const tabGroup = new TabGroup({
        id: uuidv4(),
        timestamp: new Date().getTime(),
        tabs: filteredTabs,
      });

      resolve(tabGroup);
    });
  }

  /**
   * Saves provided tab groups to local storage.
   */
  async addTabGroups(tabGroups: TabGroups) {
    if (tabGroups?.length > 0) {
      const currentTabGroups = await firstValueFrom(this.tabGroups$);

      const newTabGroups: TabGroups = currentTabGroups ?? [];
      const currentGroupsMap = keyBy(newTabGroups, 'id');

      tabGroups.forEach((newGroup) => {
        const currentGroup = currentGroupsMap[newGroup.id];
        if (currentGroup) {
          currentGroup.mergeTabs(newGroup.tabs);
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
      existingGroup.mergeTabs(tabGroup.tabs);
    } else {
      tabGroups.push(tabGroup);
    }

    this.tabGroupsSource$.next(tabGroups);

    this.save();
  }

  /**
   * Add tab list to group specified.
   */
  async addTabs(group: TabGroup, tabs: BrowserTabs) {
    let filteredTabs = tabs.filter(({ url }) => !ignoreUrlsRegExp.test(url));

    if (filteredTabs.length === 0) {
      this.displayMessage('Tab list in invalid');
    } else {
      const existingUrls = keyBy(group.tabs, 'url');
      filteredTabs = filteredTabs.filter(({ url }) => !existingUrls[url]);

      if (filteredTabs?.length > 0) {
        let tabGroups = await firstValueFrom(this.tabGroups$);
        const bottomSheetRef = this.openTabsSelector(filteredTabs);
        const tabs: BrowserTabs = await lastValueFrom(bottomSheetRef.afterDismissed());

        if (tabs?.length > 0) {
          group.addTabs(tabs);
          this.tabGroupsSource$.next(tabGroups);
          await this.save();
          this.navService.go(group.id, tabs[0].id);

          const messageRef = this.displayMessage(`Added ${tabs.length} tabs`, ActionIcon.Undo);
          const { dismissedByAction: revert } = await lastValueFrom(messageRef.afterDismissed());
          
          if (revert) {
            group.removeTabs(tabs);
            this.tabGroupsSource$.next(tabGroups);
            this.save();
          }
        }
      } else {
        this.displayMessage('All tabs are already in the list');
      }
    }
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
          this.navService.clear();
          tabGroup.removeTabAt(removeIndex);

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
          tabGroup.addTabAt(removeIndex, removedTab);
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

      this.navService.clear();
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
  async removeTabGroups(tabGroups: TabGroups): Promise<MatSnackBarRef<MessageComponent>> {
    return new Promise(async (resolve) => {
      const currentTabGroups = await firstValueFrom(this.tabGroups$);
      const messageRef = this.displayMessage('Items removed', ActionIcon.Undo);

      const removedGroups = remove(currentTabGroups, (tabGroup) => tabGroups.includes(tabGroup));

      if (removedGroups?.length > 0) {
        this.navService.clear();
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
    const tabGroups = await firstValueFrom(this.tabGroups$);
    const collections = tabGroups.map(
      ({ id, timestamp, tabs }): Collection => ({
        id,
        timestamp,
        tabs,
      })
    );

    return await saveTabGroups(collections);
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

  /**
   * Opens tabs selector bottom sheet.
   */
  openTabsSelector(tabs: BrowserTabs): MatBottomSheetRef<TabsSelectorComponent> {
    this.navService.clear();
    return this.bottomSheet.open(TabsSelectorComponent, {
      data: tabs,
      panelClass: 'bottom-sheet',
    });
  }
}
