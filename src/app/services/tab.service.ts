import { Injectable } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import flatMap from 'lodash/flatMap';
import keyBy from 'lodash/keyBy';
import remove from 'lodash/remove';
import moment from 'moment';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import {
  ActionIcon,
  BrowserTab,
  BrowserTabs,
  Collection,
  Collections,
  getCollections,
  getFaviconStore,
  getHostnameGroup,
  getUrlHost,
  ignoreUrlsRegExp,
  saveCollections,
  StorageChanges,
  syncToTabs,
  TabGroup,
  TabGroups,
  Tabs,
  TabsByHostname,
  Timeline,
  TimelineElement,
  translate,
} from 'src/app/utils';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { MessageComponent, RenameDialogComponent, TabsSelectorComponent } from '../modules/shared';
import { MessageService } from './message.service';
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
  readonly translate = translate();

  /**
   * Behavior subject will be used to populate tabs data when managing tabs.
   */
  private readonly tabGroupsSource$ = new BehaviorSubject<TabGroups>(null);

  /**
   * Observable used by components to listen for tabs data changes.
   */
  readonly tabGroups$ = this.tabGroupsSource$.pipe(
    map((res) =>
      res?.length > 0 ? res.sort(({ timestamp: a }, { timestamp: b }) => (a < 0 || b < 0 ? a - b : b - a)) : null
    ),
    shareReplay(1)
  );

  /**
   * Tab list source from all tab groups.
   */
  readonly tabs$: Observable<BrowserTabs> = this.tabGroups$.pipe(
    map((tabGroups) => flatMap(tabGroups, (tabGroup) => tabGroup.tabs)),
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
    private message: MessageService,
    private navService: NavService
  ) {
    this.initService();
  }

  /**
   * Initialize service and load stored tab groups.
   */
  private async initService() {
    const collections = await getCollections();
    this.tabGroupsSource$.next(collections?.map((collection) => new TabGroup(collection)));

    chrome.storage.onChanged.addListener((changes: StorageChanges) => this.syncCollections(changes));
  }

  /**
   * Sync local storage collection with loaded UI tap groups.
   */
  private async syncCollections(changes: StorageChanges) {
    const changedGroupIds = Object.keys(changes).filter((groupId) => uuidValidate(groupId));

    if (changedGroupIds?.length > 0) {
      const tabGroups = (await firstValueFrom(this.tabGroups$)) ?? [];
      const groupsById = keyBy(tabGroups, 'id');
      const favicon = await getFaviconStore();

      changedGroupIds.forEach((groupId) => {
        const { oldValue, newValue } = changes[groupId];
        const group = groupsById[groupId];
        if (oldValue && !newValue && group) {
          remove(tabGroups, ({ id }) => id === groupId);
        } else if (newValue && !oldValue && !group) {
          const newGroup = new TabGroup({
            id: groupId,
            timestamp: newValue[0],
            tabs: syncToTabs(newValue[1]).map((tab) => {
              tab.favIconUrl = favicon[getUrlHost(tab.url)];
              return tab;
            }),
          });
          tabGroups.push(newGroup);
        } else if (newValue && group) {
          group.timestamp = newValue[0];
          group.mergeTabs(
            syncToTabs(newValue[1]).map((tab) => {
              tab.favIconUrl = favicon[getUrlHost(tab.url)];
              return tab;
            }),
            true
          );
        }
      });

      this.tabGroupsSource$.next(tabGroups);
    }
  }

  /**
   * Generates icon group based on tab group specified.
   */
  createHostnameGroups(tabGroups: TabGroups): TabsByHostname {
    const ret: TabsByHostname = {};

    tabGroups.forEach((tabGroup) => (ret[tabGroup.id] = getHostnameGroup(tabGroup.tabs)));

    return ret;
  }

  /**
   * Creates timeline array and hashmap that maps each timeline item to groups by their timestamp.
   */
  private createTimeline(tabGroups: TabGroups): Timeline {
    const timeline: { [label in string]: TimelineElement } = {};

    tabGroups.forEach((timelineItem) => {
      const timeLabel = this.getTimelineLabel(timelineItem);
      if (!timeline[timeLabel]) {
        timeline[timeLabel] = {
          elements: [],
          label: timeLabel,
        };
      }

      timeline[timeLabel].elements.push(timelineItem);
    });

    return Object.values(timeline);
  }

  /**
   * Returns timeline label based on group timestamp.
   */
  private getTimelineLabel(tabGroup: TabGroup): string {
    const { timestamp } = tabGroup;
    const date = moment(timestamp);
    const now = moment();

    switch (true) {
      case timestamp < 0:
        return this.translate('pinned');
      case date.isSame(now, 'd'):
        return this.translate('today');
      case date.isSame(now.subtract(1, 'd'), 'd'):
        return this.translate('yesterday');
      case date.isSame(now, 'w'):
        return this.translate('week');
      case date.isSame(now, 'y'):
        return date.format('MMMM');
      default:
        return date.format('MMMM YYYY');
    }
  }

  /**
   * Toggles pinned status for group specified.
   */
  favGroupToggle(group: TabGroup) {
    this.navService.reset();
    group.favToggle();
    this.save();
  }

  /**
   * Generates tab group from browser tab list.
   */
  createTabGroup(tabs: Tabs): TabGroup {
    const filteredTabs: BrowserTabs = tabs
      .filter((tab) => !ignoreUrlsRegExp.test(tab.url))
      .map(
        ({ id, url, title, favIconUrl, pinned }): BrowserTab => ({
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
      this.message.open(this.translate('invalidTabList'));
    } else {
      const tabsByUrl = keyBy(group.tabs, 'url');
      const tabsById = keyBy(group.tabs, 'id');
      filteredTabs = filteredTabs.filter(({ id, url }) => !tabsByUrl[url] && !tabsById[id]);

      if (filteredTabs?.length > 0) {
        const bottomSheetRef = this.openTabsSelector(filteredTabs);
        const tabs: BrowserTabs = await lastValueFrom(bottomSheetRef.afterDismissed());

        if (tabs?.length > 0) {
          group.prepend(tabs);
          await this.save();

          const tabsLen = tabs.length;
          const messageRef = this.message.open(
            this.translate(tabsLen > 1 ? 'itemsAddedCount' : 'itemAdded', {
              count: tabsLen,
            }),
            ActionIcon.Undo
          );
          const { dismissedByAction: revert } = await lastValueFrom(messageRef.afterDismissed());

          if (revert) {
            group.removeTabs(tabs);
            this.save();
          }
        }
      } else {
        this.message.open(this.translate('tabsExistError'));
      }
    }
  }

  /**
   * Removes tab from specified tab group.
   */
  async removeTab(removedTab: BrowserTab): Promise<MatSnackBarRef<MessageComponent>> {
    return new Promise(async (resolve) => {
      let messageRef: MatSnackBarRef<MessageComponent>;

      const tabGroup = await this.getGroupByTab(removedTab);

      let removeIndex = -1;

      if (tabGroup) {
        removeIndex = tabGroup.tabs.findIndex((tab) => tab === removedTab);

        if (removeIndex > -1) {
          tabGroup.removeTabAt(removeIndex);

          if (tabGroup.tabs.length === 0) {
            messageRef = await this.removeTabGroup(tabGroup);
          } else if (removeIndex > -1) {
            this.save();
            messageRef = this.message.open(this.translate('itemRemoved'), ActionIcon.Undo);
          }
        }
      }

      resolve(messageRef);

      if (removeIndex > -1) {
        const { dismissedByAction: revert } = await lastValueFrom(messageRef.afterDismissed());

        if (revert) {
          tabGroup.addTabAt(removeIndex, removedTab);
          this.save();
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

      this.save();

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
      const messageRef = this.message.open(this.translate('itemRemoved'), ActionIcon.Undo);
      const removedGroups = remove(tabGroups, (tg) => tg === tabGroup);

      this.tabGroupsSource$.next(tabGroups);

      this.navService.reset();
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
      const removedGroups = remove(currentTabGroups, (tabGroup) => tabGroups.includes(tabGroup));

      if (removedGroups?.length > 0) {
        const rmLen = removedGroups.length;
        const messageRef = this.message.open(
          this.translate(rmLen > 1 ? 'itemsRemovedCount' : 'itemRemoved', {
            count: rmLen,
          }),
          ActionIcon.Undo
        );

        this.navService.reset();
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

    const collections: Collections = tabGroups?.map(
      ({ id, timestamp, tabs }): Collection => ({
        id,
        timestamp,
        tabs,
      })
    );

    return await saveCollections(collections);
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

  hasTabGroup(tabGroup: TabGroup): boolean {
    return this.tabGroupsSource$.value?.includes(tabGroup);
  }
}
