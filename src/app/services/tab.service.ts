import { Injectable } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';
import { keyBy, remove } from 'lodash';
import moment from 'moment';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import {
  ActionIcon,
  BrowserTab,
  BrowserTabs,
  Collection,
  Collections,
  getHostnameGroup,
  getSavedTabs,
  ignoreUrlsRegExp,
  saveTabGroups,
  TabGroup,
  TabGroups,
  Tabs,
  TabsByHostname,
  Timeline,
  TimelineElement,
} from 'src/app/utils';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { MessageComponent, RenameDialogComponent, TabsSelectorComponent } from '../modules/shared';
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

  constructor(
    private bottomSheet: MatBottomSheet,
    private dialog: MatDialog,
    private navService: NavService,
    private snackBar: MatSnackBar
  ) {
    this.initService();
  }

  /**
   * Initialize service and load stored tab groups.
   */
  private async initService() {
    await this.syncCollections();
    chrome.storage.onChanged.addListener(() => this.syncCollections());
  }

  /**
   * Sync local storage collection with loaded UI tap groups.
   */
  private async syncCollections() {
    const collections = (await getSavedTabs()) ?? [];
    const tabGroups = (await firstValueFrom(this.tabGroups$)) ?? [];

    const savedGroupIds = keyBy(collections, 'id');
    const currGroupIds = keyBy(tabGroups, 'id');

    collections.forEach((collection) => {
      if (!(collection.id in currGroupIds)) {
        tabGroups.push(new TabGroup(collection));
      }
    });

    for (let i = 0; i < tabGroups.length; i++) {
      if (!(tabGroups[i].id in savedGroupIds)) {
        tabGroups.splice(i--, 1);
      }
    }

    this.tabGroupsSource$.next(tabGroups);
  }

  /**
   * Generates icon group based on tab group specified.
   */
  private createHostnameGroups(tabGroups: TabGroups): TabsByHostname {
    const ret: TabsByHostname = {};

    tabGroups.forEach((tabGroup) => (ret[tabGroup.id] = getHostnameGroup(tabGroup.tabs)));

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
  createTabGroup(tabs: Tabs): TabGroup {
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

    return new TabGroup({
      id: uuidv4(),
      timestamp: new Date().getTime(),
      tabs: filteredTabs,
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

      // TODO: ⛔ This should not be necessary, but new groups don't render until click
      this.tabGroupsSource$.next(newTabGroups);

      this.save(newTabGroups);
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

    // TODO: ⛔ This should not be necessary, but new groups don't render until click
    this.tabGroupsSource$.next(tabGroups);

    this.save(tabGroups);
  }

  /**
   * Add tab list to group specified.
   */
  async addTabs(group: TabGroup, tabs: BrowserTabs) {
    let filteredTabs = tabs.filter(({ url }) => !ignoreUrlsRegExp.test(url));

    if (filteredTabs.length === 0) {
      this.displayMessage('Tab list is invalid');
    } else {
      const existingUrls = keyBy(group.tabs, 'url');
      filteredTabs = filteredTabs.filter(({ url }) => !existingUrls[url]);

      if (filteredTabs?.length > 0) {
        let tabGroups = await firstValueFrom(this.tabGroups$);
        const bottomSheetRef = this.openTabsSelector(filteredTabs);
        const tabs: BrowserTabs = await lastValueFrom(bottomSheetRef.afterDismissed());

        if (tabs?.length > 0) {
          group.prepend(tabs);

          this.tabGroupsSource$.next(tabGroups);
          await this.save(tabGroups);

          const tabsLen = tabs.length;
          const messageRef = this.displayMessage(`Added ${tabsLen} tab${tabsLen > 1 ? 's' : ''}`, ActionIcon.Undo);
          const { dismissedByAction: revert } = await lastValueFrom(messageRef.afterDismissed());

          if (revert) {
            group.removeTabs(tabs);
            this.save(tabGroups);
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
          tabGroup.removeTabAt(removeIndex);

          if (tabGroup.tabs.length === 0) {
            messageRef = await this.removeTabGroup(tabGroup);
          } else if (removeIndex > -1) {
            this.tabGroupsSource$.next(tabGroups);
            this.save(tabGroups);
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
          this.save(tabGroups);
        }
      }
    });
  }

  /**
   * Opens tab edit dialog.
   */
  async updateTab(tab: BrowserTab): Promise<BrowserTab> {
    const dialogRef = this.dialog.open(RenameDialogComponent, { data: tab, disableClose: true });
    let updatedTab: BrowserTab = await lastValueFrom(dialogRef.afterClosed());

    if (updatedTab && (tab.title !== updatedTab.title || tab.url !== updatedTab.url)) {
      const group = await this.getGroupByTab(tab);
      updatedTab = group.updateTab(tab, updatedTab);

      const tabGroups = await firstValueFrom(this.tabGroups$);
      this.tabGroupsSource$.next(tabGroups);

      await this.save(tabGroups);

      return updatedTab;
    }
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

      this.navService.reset();
      resolve(messageRef);

      this.save(tabGroups);

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
      const removedGroups = remove(currentTabGroups, (tabGroup) => tabGroups.includes(tabGroup));

      if (removedGroups?.length > 0) {
        const rmLen = removedGroups.length;
        const messageRef = this.displayMessage(`${rmLen} item${rmLen > 1 ? 's' : ''} removed`, ActionIcon.Undo);

        this.navService.reset();
        this.tabGroupsSource$.next(currentTabGroups);

        resolve(messageRef);

        this.save(currentTabGroups);

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
  async save(tabGroups: TabGroups): Promise<void> {
    const collections: Collections = tabGroups?.map(
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
    return this.bottomSheet.open(TabsSelectorComponent, {
      data: tabs,
      panelClass: 'bottom-sheet',
    });
  }
}
