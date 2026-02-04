import { provideZonelessChangeDetection } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { firstValueFrom, lastValueFrom, take, takeWhile } from 'rxjs';
import {
  getBrowserApi,
  getBrowserTabsMock,
  getTabGroupMock,
  MatDialogMock,
  MessageServiceMock,
  MockStorageArea,
  mockStorageArea,
  NavServiceMock,
} from 'src/mocks';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { tabsToSync } from '../utils/collections';
import { Collection, Collections, TabGroup } from '../utils/models';
import { MessageService } from './message.service';
import { NavService } from './nav.service';
import { TabService } from './tab.service';

describe('TabService', () => {
  let spectator: SpectatorService<TabService>;
  const createService = createServiceFactory({
    service: TabService,
    imports: [MatSnackBarModule, MatDialogModule],
    providers: [
      provideZonelessChangeDetection(),
      {
        provide: NavService,
        useClass: NavServiceMock,
      },
      {
        provide: MatDialog,
        useClass: MatDialogMock,
      },
      {
        provide: MessageService,
        useClass: MessageServiceMock,
      },
    ],
  });

  beforeEach(() => {
    vi.stubGlobal('chrome', getBrowserApi([], new MockStorageArea(mockStorageArea)));

    spectator = createService();
  });

  test('should be created', () => {
    expect(spectator.service).toBeTruthy();
  });

  test('should initialize tabs', async () => {
    const tabGroups = await lastValueFrom(spectator.service['tabGroups$'].pipe(takeWhile((v) => !v, true)));

    expect(tabGroups.length).toBe(3);
    expect(tabGroups[0].tabs.length).toBe(4);
    expect(tabGroups[1].tabs.length).toBe(4);
    expect(tabGroups[2].tabs.length).toBe(6);
  });

  test('should generate tab group', () => {
    const tabGroup = spectator.service.createTabGroup(getBrowserTabsMock());

    expect(tabGroup.tabs.length).toBe(3);
  });

  test('should save tab group', async () => {
    let tabGroups = await lastValueFrom(spectator.service['tabGroups$'].pipe(takeWhile((v) => !v, true)));
    expect(tabGroups.length).toBe(3);

    const tabGroup = spectator.service.createTabGroup(getBrowserTabsMock());
    await spectator.service.addTabGroup(tabGroup);

    tabGroups = await firstValueFrom(spectator.service['tabGroups$'].pipe(take(1)));

    expect(tabGroups.length).toBe(4);
    expect(tabGroups[0].tabs.length).toBe(3);

    const [tab1, tab2, tab3] = tabGroups[0].tabs;

    expect(tab1.id).toBeGreaterThan(0);
    expect(tab1.title).toBe('GitLab - The One DevOps Platform');
    expect(tab1.url).toBe('https://about.gitlab.com/');

    expect(tab2.id).toBeGreaterThan(0);
    expect(tab2.title).toBe('GitHub: Where the world builds software · GitHub');
    expect(tab2.url).toBe('https://github.com/');

    expect(tab3.id).toBeGreaterThan(0);
    expect(tab3.title).toBe('Fedora');
    expect(tab3.url).toBe('https://getfedora.org/');
  });

  test('should generate icon groups', async () => {
    const tabGroups = await lastValueFrom(spectator.service['tabGroups$'].pipe(takeWhile((v) => !v, true)));
    expect(tabGroups.length).toBe(3);
  });

  test('should merge new tab groups with current ones', async () => {
    let groups = await lastValueFrom(spectator.service['tabGroups$'].pipe(takeWhile((v) => !v, true)));

    expect(groups.length).toBe(3);

    let [group1, group2, group3] = groups;

    expect(group1.tabs.length).toBe(4);
    expect(group2.tabs.length).toBe(4);
    expect(group3.tabs.length).toBe(6);

    let [tab1, tab2] = group2.tabs;
    expect(tab1.id).toBe(669393880);
    expect(tab1.title).toBe("openSUSE - Linux OS. The makers' choice for sysadmins, developers and desktop users.");
    expect(tab1.url).toBe('https://www.opensuse.org/');
    expect(tab2.id).toBe(669393881);
    expect(tab2.title).toBe('Enterprise Open Source and Linux | Ubuntu');
    expect(tab2.url).toBe('https://ubuntu.com/');

    // add same groups and groups array should be the same
    const collections: Collections = groups?.map(
      ({ id, timestamp, tabs }): Collection => ({
        id,
        timestamp,
        tabs,
      })
    );

    await spectator.service.addTabGroups(collections.map((collection) => new TabGroup(collection)));

    groups = await lastValueFrom(spectator.service['tabGroups$'].pipe(take(1)));

    expect(groups.length).toBe(3);

    [group1, group2, group3] = groups;

    expect(group1.tabs.length).toBe(4);
    expect(group2.tabs.length).toBe(4);
    expect(group3.tabs.length).toBe(6);

    // update groups with group ID that already exists
    await spectator.service.addTabGroups([
      new TabGroup({
        id: '533a389c-acc7-4fd9-9776-3e2b497d5635',
        tabs: [
          {
            id: 669393886,
            title: 'NEW TITLE 1',
            url: 'https://newlink.com/',
          },
          {
            id: 669393887,
            title: 'NEW TITLE 2',
            url: 'https://anotherlink.com/',
          },
          {
            favIconUrl: 'https://duckduckgo.com/favicon.ico',
            id: 53,
            title: 'DuckDuckGo',
            url: 'https://duckduckgo.com/',
          },
        ],
        timestamp: 1711225971015,
      }),
    ]);

    groups = await lastValueFrom(spectator.service['tabGroups$'].pipe(take(1)));

    expect(groups.length).toBe(3);

    [group1] = groups;

    // tabs list should be updated
    expect(group1.tabs.length).toBe(5);

    // tabs titles and urls for existing tabs should be updated
    [tab1, tab2] = group1.tabs;
    expect(tab1.id).toBe(669393886);
    expect(tab1.title).toBe('NEW TITLE 1');
    expect(tab1.url).toBe('https://newlink.com/');
    expect(tab2.id).toBe(669393887);
    expect(tab2.title).toBe('NEW TITLE 2');
    expect(tab2.url).toBe('https://anotherlink.com/');

    // should add new group
    await spectator.service.addTabGroups([
      new TabGroup({
        id: '0c7b96b3-b457-4208-bff9-a249177c1e03',
        tabs: [
          {
            favIconUrl: 'https://github.githubassets.com/favicons/favicon.svg',
            id: 123,
            title: 'GitHub: Where the world builds software · GitHub',
            url: 'https://github.com/',
          },
        ],
        timestamp: new Date().getTime(),
      }),
    ]);

    groups = await lastValueFrom(spectator.service['tabGroups$'].pipe(take(1)));

    expect(groups.length).toBe(4);

    [group1] = groups;

    expect(group1.tabs.length).toBe(1);
  });

  test('should sync collections', async () => {
    let groups = await lastValueFrom(spectator.service['tabGroups$'].pipe(takeWhile((v) => !v, true)));

    expect(groups.length).toBe(3);

    const mock = getTabGroupMock();

    await spectator.service['syncCollections']({
      '0c7b96b3-b457-4208-bff9-a249177c1e03': {
        newValue: [mock.timestamp, tabsToSync(mock.tabs)],
      },
    });

    groups = await lastValueFrom(spectator.service['tabGroups$'].pipe(take(1)));

    expect(groups.length).toBe(4);
  });

  test('should generate timeline', async () => {
    const timeline = await lastValueFrom(spectator.service.groupsTimeline$.pipe(takeWhile((v) => !v, true)));

    expect(timeline).toBeDefined();

    expect(timeline.length).toBeGreaterThan(0);
    expect(timeline[0].elements.length).toBeGreaterThan(0);
    expect(timeline[0].label).toBeDefined();
  });

  test('should remove groups', async () => {
    let groups = await lastValueFrom(spectator.service['tabGroups$'].pipe(takeWhile((v) => !v, true)));

    await spectator.service.removeTabGroups(groups);

    groups = await firstValueFrom(spectator.service['tabGroups$'].pipe(take(1)));
    expect(groups).toBeNull();
  });

  test('should remove group', async () => {
    let groups = await lastValueFrom(spectator.service['tabGroups$'].pipe(takeWhile((v) => !v, true)));

    expect(groups.length).toBe(3);

    await spectator.service.removeTabGroup(groups[0]);
    groups = await firstValueFrom(spectator.service['tabGroups$'].pipe(take(1)));
    expect(groups.length).toBe(2);
  });

  test('should sort recent tabs', () => {
    const tabs = [
      {
        id: 787499525277.7153,
        title: 'Accessibility | Angular Material',
        url: 'https://material.angular.io/cdk/a11y/overview',
        favIconUrl: 'https://material.angular.io/assets/img/favicons/favicon.ico?v=8.2.3',
      },
      {
        id: 1598195848292.6968,
        title: 'API reference',
        url: 'https://developer.chrome.com/docs/extensions/reference/api',
        favIconUrl:
          'https://www.gstatic.com/devrel-devsite/prod/v26b300f563a53ffacd00cce6a8a17d6c34b57fcb0529359ecdc637e6db343c18/chrome/images/favicon.png',
      },
      {
        id: 386983855156.07916,
        title: 'Options · Prettier',
        url: 'https://prettier.io/docs/en/options',
        favIconUrl: 'https://prettier.io/icon.png',
      },
    ];

    let sortedTabs = spectator.service.sortByRecent(tabs, null);

    expect(sortedTabs.length).toBe(3);
    expect(sortedTabs[0].id).toBe(787499525277.7153);
    expect(sortedTabs[1].id).toBe(1598195848292.6968);
    expect(sortedTabs[2].id).toBe(386983855156.07916);

    const recentMap = new Map([
      [386983855156.07916, 2],
      [1598195848292.6968, 1],
      [787499525277.7153, 0],
      [-1, -1],
      [0, 0],
    ]);

    sortedTabs = spectator.service.sortByRecent(tabs, recentMap);

    expect(sortedTabs.length).toBe(3);
    expect(sortedTabs[0].id).toBe(386983855156.07916);
    expect(sortedTabs[1].id).toBe(1598195848292.6968);
    expect(sortedTabs[2].id).toBe(787499525277.7153);
  });
});
