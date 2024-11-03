import { Injectable } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { format, isSameDay, isSameWeek, isSameYear, subDays } from 'date-fns';
import { debounce, flatMap, keyBy, remove, uniqBy } from 'lodash-es';
import { BehaviorSubject, Observable, firstValueFrom, lastValueFrom } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { validate as uuidValidate, v4 as uuidv4 } from 'uuid';

import { RenameDialogComponent, TabsSelectorComponent } from '../components';
import {
  ActionIcon,
  BrowserTab,
  BrowserTabs,
  Collection,
  Collections,
  MessageRef,
  StorageChanges,
  TabGroup,
  TabGroups,
  Tabs,
  TabsByHostname,
  Timeline,
  TimelineElement,
  getCollections,
  getFaviconStore,
  getHostnameGroup,
  getUrlHost,
  ignoreUrlsRegExp,
  queryCurrentWindow,
  saveCollections,
  syncToTabs,
  translate,
} from '../utils';
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
  /**
   * Behavior subject will be used to populate tabs data when managing tabs.
   */
  private readonly tabGroupsSource$ = new BehaviorSubject<TabGroups>(null);

  /**
   * Observable used by components to listen for tabs data changes.
   */
  private readonly tabGroups$ = this.tabGroupsSource$.pipe(
    map((res) =>
      res?.length > 0 ? res.sort(({ timestamp: a }, { timestamp: b }) => (a < 0 || b < 0 ? a - b : b - a)) : null
    ),
    shareReplay(1)
  );

  readonly #updated$ = new BehaviorSubject<boolean>(true);

  /**
   * Tab list source from all tab groups.
   */
  readonly tabs$: Observable<BrowserTabs> = this.#updated$.pipe(
    switchMap(() => this.tabGroups$.pipe(map((tabGroups) => flatMap(tabGroups, (tabGroup) => tabGroup.tabs)))),
    shareReplay(1)
  );

  /**
   * Groups timeline.
   */
  readonly groupsTimeline$: Observable<Timeline> = this.tabGroups$.pipe(
    map((tabGroups) => (tabGroups?.length > 0 ? this.createTimeline(tabGroups) : null)),
    shareReplay(1)
  );

  readonly #openTabChanges$ = new BehaviorSubject<Tabs>(null);

  readonly openTabChanges$ = this.#openTabChanges$.asObservable();

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

    chrome.tabs.onCreated.addListener(this.#updateTabs);
    chrome.tabs.onRemoved.addListener(this.#updateTabs);
    chrome.tabs.onUpdated.addListener(this.#updateTabs);

    this.#updateTabs();
  }

  readonly #updateTabs = debounce(async () => {
    const tabs = await queryCurrentWindow();
    this.#openTabChanges$.next(tabs);
  }, 150);

  /**
   * Sync local storage collection with loaded UI tab groups.
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
    const timeline: { [label: string]: TimelineElement } = {};

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
    const date = new Date(timestamp);
    const now = new Date();

    switch (true) {
      case timestamp < 0:
        return translate('pinned');
      case isSameDay(now, date):
        return translate('today');
      case isSameDay(subDays(now, 1), 'd'):
        return translate('yesterday');
      case isSameWeek(now, date):
        return translate('week');
      case isSameYear(now, date):
        return format(date, 'MMMM');
      default:
        return format(date, 'MMMM yyyy');
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
    const timestamp = new Date().getTime();
    const filteredTabs: BrowserTabs = tabs
      .filter((tab) => !ignoreUrlsRegExp.test(tab.url))
      .map(
        ({ url, title, favIconUrl }, index): BrowserTab => ({
          favIconUrl,
          id: (timestamp + index) * Math.random(),
          title,
          url,
        })
      );

    return new TabGroup({
      id: uuidv4(),
      timestamp,
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
    let filteredTabs = uniqBy(
      tabs.filter(({ url }) => !ignoreUrlsRegExp.test(url)),
      'url'
    );

    if (filteredTabs.length === 0) {
      this.message.open(translate('invalidTabList'));
    } else {
      const tabsByUrl = keyBy(group.tabs, 'url');
      filteredTabs = filteredTabs.filter(({ url }) => !tabsByUrl[url]);

      if (filteredTabs?.length > 0) {
        const bottomSheetRef = this.openTabsSelector(filteredTabs);
        const tabs: BrowserTabs = await lastValueFrom(bottomSheetRef.afterDismissed());

        if (tabs?.length > 0) {
          group.prepend(tabs);
          await this.save();

          const tabsLen = tabs.length;
          const messageRef = this.message.open(
            translate(tabsLen > 1 ? 'itemsAddedCount' : 'itemAdded', tabsLen.toString()),
            ActionIcon.Undo
          );
          const { dismissedByAction: revert } = await lastValueFrom(messageRef.afterDismissed());

          if (revert) {
            group.removeTabs(tabs);
            this.save();
          }
        }
      } else {
        this.message.open(translate('tabsExistError'));
      }
    }
  }

  /**
   * Removes tab from specified tab group.
   */
  async removeTab(removedTab: BrowserTab): Promise<MessageRef> {
    return new Promise(async (resolve) => {
      let messageRef: MessageRef;

      const tabGroup = await this.getGroupByTab(removedTab);

      let removeIndex = -1;

      if (tabGroup) {
        removeIndex = tabGroup.tabs.findIndex((tab) => tab === removedTab);

        if (removeIndex > -1) {
          this.navService.reset('groupId', 'tabId');
          tabGroup.removeTabAt(removeIndex);

          if (tabGroup.tabs.length === 0) {
            messageRef = await this.removeTabGroup(tabGroup);
          } else {
            this.save();
            messageRef = this.message.open(translate('itemRemoved'), ActionIcon.Undo);
          }

          this.#updated$.next(true);
        }
      }

      resolve(messageRef);

      if (removeIndex > -1) {
        const { dismissedByAction: revert } = await lastValueFrom(messageRef.afterDismissed());

        if (revert) {
          tabGroup.addTabAt(removeIndex, removedTab);
          this.save();

          this.#updated$.next(true);
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

      this.#updated$.next(true);
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
  async removeTabGroup(tabGroup: TabGroup): Promise<MessageRef> {
    return new Promise(async (resolve) => {
      const tabGroups = await firstValueFrom(this.tabGroups$);
      const messageRef = this.message.open(translate('itemRemoved'), ActionIcon.Undo);
      const removedGroups = remove(tabGroups, (tg) => tg === tabGroup);

      this.tabGroupsSource$.next(tabGroups);

      this.navService.reset('groupId');
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
  async removeTabGroups(tabGroups: TabGroups): Promise<MessageRef> {
    return new Promise(async (resolve) => {
      const currentTabGroups = await firstValueFrom(this.tabGroups$);
      const removedGroups = remove(currentTabGroups, (tabGroup) => tabGroups.includes(tabGroup));

      if (removedGroups?.length > 0) {
        const rmLen = removedGroups.length;
        const messageRef = this.message.open(
          translate(rmLen > 1 ? 'itemsRemovedCount' : 'itemRemoved', rmLen.toString()),
          ActionIcon.Undo
        );

        this.navService.reset('groupId');
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
