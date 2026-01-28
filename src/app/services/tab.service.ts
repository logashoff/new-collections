import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { format, isSameDay, isSameWeek, isSameYear, subDays } from 'date-fns';
import { remove, uniqBy } from 'lodash-es';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

import type { TabsSelectorComponent } from '../components';
import {
  ActionIcon,
  BrowserTab,
  BrowserTabs,
  Collection,
  Collections,
  getCollections,
  getFaviconStore,
  getHostnameGroup,
  getRecentTabs,
  getUrlHost,
  ignoreUrlsRegExp,
  isUuid,
  MessageRef,
  recentKey,
  RecentMap,
  removeRecent,
  saveCollections,
  StorageChanges,
  syncToTabs,
  TabGroup,
  TabGroups,
  TabId,
  Tabs,
  TabsByHostname,
  Timeline,
  TimelineElement,
  translate,
  UUID,
  uuid,
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
  readonly #dialog = inject(MatDialog);
  readonly #message = inject(MessageService);
  readonly #navService = inject(NavService);

  /**
   * Behavior subject will be used to populate tabs data when managing tabs.
   */
  readonly #tabGroupsSource$ = new BehaviorSubject<TabGroups>(null);

  /**
   * Observable used by components to listen for tabs data changes.
   */
  private readonly tabGroups$ = this.#tabGroupsSource$.pipe(
    map((tabGroups) =>
      tabGroups?.length > 0
        ? tabGroups.sort(({ timestamp: a }, { timestamp: b }) => (a < 0 || b < 0 ? a - b : b - a))
        : null
    ),
    shareReplay(1)
  );

  readonly #updated$ = new BehaviorSubject<boolean>(true);

  /**
   * Tab list source from all tab groups.
   */
  readonly tabs$: Observable<BrowserTabs> = this.#updated$.pipe(
    switchMap(() => this.tabGroups$.pipe(map((tabGroups) => tabGroups?.map(({ tabs }) => tabs).flat()))),
    shareReplay(1)
  );

  readonly #recentTabs$ = new BehaviorSubject<RecentMap>(null);

  readonly recentTabs$: Observable<RecentMap> = this.#recentTabs$.asObservable();

  /**
   * Groups timeline.
   */
  readonly groupsTimeline$: Observable<Timeline> = this.tabGroups$.pipe(
    map((tabGroups) => (tabGroups?.length > 0 ? this.createTimeline(tabGroups) : null)),
    shareReplay(1)
  );

  constructor() {
    void this.initService();
  }

  sortByRecent(tabs: BrowserTabs, recentTabs: RecentMap) {
    if (recentTabs) {
      return tabs?.sort((a, b) => {
        const rankA = recentTabs.get(a.id) ?? 0;
        const rankB = recentTabs.get(b.id) ?? 0;

        return rankB - rankA;
      });
    }

    return tabs;
  }

  /**
   * Initialize service and load stored tab groups.
   */
  private async initService() {
    await this.updateRecent();

    const collections = await getCollections();
    this.#tabGroupsSource$.next(collections?.map((collection) => new TabGroup(collection)));

    chrome.storage.onChanged.addListener(async (changes: StorageChanges) => {
      if (changes[recentKey]) {
        await this.updateRecent();
      }

      await this.syncCollections(changes);
    });
  }

  private async updateRecent() {
    const recent = await getRecentTabs();
    if (recent) {
      const entries = Object.entries(recent);
      if (entries.length > 0) {
        this.#recentTabs$.next(new Map(entries.map(([key, value]) => [parseFloat(key), value])));
      } else {
        this.#recentTabs$.next(null);
      }
    } else {
      this.#recentTabs$.next(null);
    }
  }

  /**
   * Sync local storage collection with loaded UI tab groups.
   */
  private async syncCollections(changes: StorageChanges) {
    const changedGroupIds = Object.keys(changes).filter((groupId) => isUuid(groupId as UUID)) as UUID[];

    if (changedGroupIds?.length > 0) {
      const tabGroups = (await firstValueFrom(this.tabGroups$)) ?? [];
      const groupsById: Map<string, TabGroup> = new Map(tabGroups.map((group) => [group.id, group]));
      const favicon = await getFaviconStore();

      changedGroupIds.forEach((groupId) => {
        const { oldValue, newValue } = changes[groupId];
        const group = groupsById.get(groupId);
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

      this.#tabGroupsSource$.next(tabGroups);
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
        return format(date, 'LLLL');
      default:
        return format(date, 'LLLL yyyy');
    }
  }

  /**
   * Toggles pinned status for group specified.
   */
  favGroupToggle(group: TabGroup) {
    void this.#navService.reset();
    group.favToggle();
    void this.save();
  }

  /**
   * Generates tab group from browser tab list.
   */
  createTabGroup(tabs: Tabs): TabGroup {
    const timestamp = new Date().getTime();
    const len = tabs.length;
    const filteredTabs: BrowserTabs = tabs
      .filter((tab) => !ignoreUrlsRegExp.test(tab.url))
      .map(
        ({ url, title, favIconUrl }, index): BrowserTab => ({
          favIconUrl,
          id: timestamp + (len - index),
          title,
          url,
        })
      );

    return new TabGroup({
      id: uuid(),
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
      const currentGroupsMap: Map<string, TabGroup> = new Map(newTabGroups.map((group) => [group.id, group]));

      tabGroups.forEach((newGroup) => {
        if (currentGroupsMap.has(newGroup.id)) {
          currentGroupsMap.get(newGroup.id).mergeTabs(newGroup.tabs);
        } else if (isUuid(newGroup.id) && newGroup.timestamp && newGroup.tabs?.length > 0) {
          newTabGroups.push(newGroup);
        }
      });

      this.#tabGroupsSource$.next(newTabGroups);

      await this.save();
    }
  }

  /**
   * Saves specified tab group to local storage.
   */
  async addTabGroup(tabGroup: TabGroup) {
    let tabGroups = await firstValueFrom(this.tabGroups$);

    tabGroups = tabGroups ?? [];
    const groupsMap: Map<string, TabGroup> = new Map(tabGroups.map((group) => [group.id, group]));

    const existingGroup = groupsMap.get(tabGroup.id);
    if (existingGroup) {
      existingGroup.mergeTabs(tabGroup.tabs);
    } else {
      tabGroups.push(tabGroup);
    }

    this.#tabGroupsSource$.next(tabGroups);

    await this.save();
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
      this.#message.open(translate('invalidTabList'));
    } else {
      const tabsByUrl: Map<string, BrowserTab> = new Map(group.tabs.map((tab) => [tab.url, tab]));
      filteredTabs = filteredTabs.filter(({ url }) => !tabsByUrl.get(url));

      if (filteredTabs?.length > 0) {
        const dialogRef = await this.openTabsSelector(filteredTabs);
        const tabs: BrowserTabs = await lastValueFrom(dialogRef.afterClosed());

        if (tabs?.length > 0) {
          const timestamp = new Date().getTime();
          const len = tabs.length;
          group.prepend(
            tabs.map((tab, index) => {
              tab.id = timestamp + (len - index);
              return tab;
            })
          );

          await this.save();
        }
      } else {
        this.#message.open(translate('tabsExistError'));
      }
    }
  }

  /**
   * Removes tab from specified tab group.
   */
  async removeTab(removedTab: BrowserTab): Promise<MessageRef> {
    let messageRef: MessageRef;

    const tabGroup = await this.getGroupByTab(removedTab);

    let removeIndex = -1;

    if (tabGroup) {
      removeIndex = tabGroup.tabs.findIndex((tab) => tab === removedTab);

      if (removeIndex > -1) {
        await this.#navService.reset('groupId', 'tabId');
        tabGroup.removeTabAt(removeIndex);

        await removeRecent(removedTab.id);

        if (tabGroup.tabs.length === 0) {
          messageRef = await this.removeTabGroup(tabGroup);
        } else {
          await this.save();
          messageRef = this.#message.open(translate('itemRemoved'), ActionIcon.Undo, 'undo');
        }

        this.#updated$.next(true);
      }
    }

    if (removeIndex > -1) {
      messageRef.afterDismissed().subscribe(({ dismissedByAction: revert }) => {
        if (revert) {
          tabGroup.addTabAt(removeIndex, removedTab);
          this.save();

          this.#updated$.next(true);
        }
      });
    }

    return messageRef;
  }

  /**
   * Opens tab edit dialog.
   */
  async updateTab(tab: BrowserTab): Promise<BrowserTab> {
    const { RenameDialogComponent } = await import('../components/rename-dialog/rename-dialog.component');

    const dialogRef = this.#dialog.open(RenameDialogComponent, { data: tab, disableClose: true });
    let updatedTab: BrowserTab = await lastValueFrom(dialogRef.afterClosed());

    if (updatedTab && (tab.title !== updatedTab.title || tab.url !== updatedTab.url)) {
      const group = await this.getGroupByTab(tab);
      updatedTab = group.updateTab(tab, updatedTab);

      this.#updated$.next(true);
      await this.save();

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
    const tabGroups = await firstValueFrom(this.tabGroups$);
    const messageRef = this.#message.open(translate('itemRemoved'), ActionIcon.Undo, 'undo');
    const removedGroups = remove(tabGroups, (tg) => tg === tabGroup);

    this.#tabGroupsSource$.next(tabGroups);

    await this.#navService.reset('groupId');

    await this.save();

    await removeRecent(tabGroup.tabs.map((tab) => tab.id));

    if (removedGroups?.length > 0) {
      messageRef.afterDismissed().subscribe(({ dismissedByAction: revert }) => {
        if (revert) {
          this.addTabGroup(tabGroup);
        }
      });
    }

    return messageRef;
  }

  /**
   * Removed multiple tab groups.
   */
  async removeTabGroups(tabGroups: TabGroups): Promise<MessageRef> {
    const currentTabGroups = await firstValueFrom(this.tabGroups$);
    const removedGroups = remove(currentTabGroups, (tabGroup) => tabGroups.includes(tabGroup));

    if (removedGroups?.length > 0) {
      const rmLen = removedGroups.length;
      const messageRef = this.#message.open(
        translate(rmLen > 1 ? 'itemsRemovedCount' : 'itemRemoved', rmLen.toString()),
        ActionIcon.Undo,
        'undo'
      );

      await this.#navService.reset('groupId');
      this.#tabGroupsSource$.next(currentTabGroups);

      await this.save();

      const tabIds: TabId[] = removedGroups.map(({ tabs }) => tabs.map(({ id }) => id)).flat();
      await removeRecent(tabIds);

      if (removedGroups?.length > 0) {
        const { dismissedByAction: revert } = await lastValueFrom(messageRef.afterDismissed());

        if (revert) {
          await this.addTabGroups(removedGroups);
        }
      }

      return messageRef;
    }
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
  async openTabsSelector(tabs: BrowserTabs): Promise<MatDialogRef<TabsSelectorComponent, Tabs>> {
    const { TabsSelectorComponent } = await import('../components/tabs-selector/tabs-selector.component');

    return this.#dialog.open(TabsSelectorComponent, {
      data: tabs,
      autoFocus: false,
    });
  }

  hasTabGroup(tabGroup: TabGroup): boolean {
    return this.#tabGroupsSource$.value?.includes(tabGroup);
  }
}
