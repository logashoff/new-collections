import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { firstValueFrom } from 'rxjs';
import {
  getBrowserTabsMock,
  getTabGroupMock,
  getTabGroupsMock,
  MatDialogMock,
  MessageServiceMock,
  NavServiceMock,
} from 'src/mocks';
import { getFaviconStore, syncToTabs, tabsToSync } from '../utils/collections';
import { ActionIcon, ignoreUrlsRegExp, TabGroup } from '../utils/models';
import { getHost, getHostname, getHostnameGroup, getUrlHost, getUrlHostname } from '../utils/utils';
import { MessageService } from './message.service';
import { NavService } from './nav.service';
import { TabService } from './tab.service';

jest.mock('src/app/utils', () => ({
  getCollections: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(getTabGroupsMock()))),
  queryCurrentWindow: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(getBrowserTabsMock()))),
  queryTabs: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(getBrowserTabsMock))),
  removeTab: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(0))),
  saveCollections: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(0))),
  translate: jest.fn().mockImplementation(() => (str) => str),
  usesDarkMode: jest.fn().mockImplementation(() => {}),
  ActionIcon,
  getFaviconStore,
  getHost,
  getHostname,
  getHostnameGroup,
  getUrlHost,
  getUrlHostname,
  ignoreUrlsRegExp,
  syncToTabs,
  TabGroup,
  tabsToSync,
}));

describe('TabService', () => {
  let spectator: SpectatorService<TabService>;
  const createService = createServiceFactory({
    service: TabService,
    imports: [MatSnackBarModule, MatBottomSheetModule],
    providers: [
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
    spectator = createService();
  });

  it('should be created', () => {
    expect(spectator.service).toBeTruthy();
  });

  it('should initialize tabs', async () => {
    const tabGroups = await firstValueFrom(spectator.service['tabGroups$']);

    expect(tabGroups.length).toBe(3);
    expect(tabGroups[0].tabs.length).toBe(5);
    expect(tabGroups[1].tabs.length).toBe(2);
    expect(tabGroups[2].tabs.length).toBe(4);
  });

  it('should generate tab group', async () => {
    const tabGroup = await spectator.service.createTabGroup(getBrowserTabsMock());

    expect(tabGroup.tabs.length).toBe(3);
  });

  it('should save tab group', async () => {
    const tabGroup = spectator.service.createTabGroup(getBrowserTabsMock());
    await spectator.service.addTabGroup(tabGroup);

    const tabGroups = await firstValueFrom(spectator.service['tabGroups$']);

    expect(tabGroups.length).toBe(4);
    expect(tabGroups[0].tabs.length).toBe(3);

    const [tab1, tab2, tab3] = tabGroups[0].tabs;

    expect(tab1.id).toBe(48);
    expect(tab1.title).toBe('GitLab - The One DevOps Platform');
    expect(tab1.url).toBe('https://about.gitlab.com/');

    expect(tab2.id).toBe(49);
    expect(tab2.title).toBe('GitHub: Where the world builds software · GitHub');
    expect(tab2.url).toBe('https://github.com/');

    expect(tab3.id).toBe(50);
    expect(tab3.title).toBe('Fedora');
    expect(tab3.url).toBe('https://getfedora.org/');
  });

  it('should generate icon groups', async () => {
    const tabGroups = await firstValueFrom(spectator.service['tabGroups$']);

    expect(tabGroups.length).toBe(3);
  });

  it('should merge new tab groups with current ones', async () => {
    let groups = await firstValueFrom(spectator.service['tabGroups$']);

    expect(groups.length).toBe(3);

    let [group1, group2, group3] = groups;

    expect(group1.tabs.length).toBe(5);
    expect(group2.tabs.length).toBe(2);
    expect(group3.tabs.length).toBe(4);

    let [tab1, tab2] = group2.tabs;
    expect(tab1.id).toBe(51);
    expect(tab1.title).toBe('GitHub: Where the world builds software · GitHub');
    expect(tab1.url).toBe('https://github.com/');
    expect(tab2.id).toBe(52);
    expect(tab2.title).toBe('DuckDuckGo — Privacy, simplified.');
    expect(tab2.url).toBe('https://duckduckgo.com/');

    // add same groups and groups array should be the same
    const collections = getTabGroupsMock();
    await spectator.service.addTabGroups(collections.map((collection) => new TabGroup(collection)));

    groups = await firstValueFrom(spectator.service['tabGroups$']);

    expect(groups.length).toBe(3);

    [group1, group2, group3] = groups;

    expect(group1.tabs.length).toBe(5);
    expect(group2.tabs.length).toBe(2);
    expect(group3.tabs.length).toBe(4);

    // update groups with group ID that already exists
    await spectator.service.addTabGroups([
      new TabGroup({
        id: 'e200698d-d053-45f7-b917-e03b104ae127',
        tabs: [
          {
            favIconUrl: 'https://github.githubassets.com/favicons/favicon.svg',
            id: 51,
            title: 'NEW TITLE 1',
            url: 'https://newlink.com/',
            pinned: false,
          },
          {
            favIconUrl: 'https://duckduckgo.com/favicon.ico',
            id: 52,
            title: 'NEW TITLE 2',
            url: 'https://anotherlink.com/',
            pinned: false,
          },
          {
            favIconUrl: 'https://duckduckgo.com/favicon.ico',
            id: 53,
            title: 'DuckDuckGo',
            url: 'https://duckduckgo.com/',
            pinned: false,
          },
        ],
        timestamp: 1650858875455,
      }),
    ]);

    groups = await firstValueFrom(spectator.service['tabGroups$']);

    expect(groups.length).toBe(3);

    [group1, group2, group3] = groups;

    // tabs list should be updated
    expect(group2.tabs.length).toBe(3);

    // tabs titles and urls for existing tabs should be updated
    [tab1, tab2] = group2.tabs;
    expect(tab1.id).toBe(51);
    expect(tab1.title).toBe('NEW TITLE 1');
    expect(tab1.url).toBe('https://newlink.com/');
    expect(tab2.id).toBe(52);
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
            pinned: false,
          },
        ],
        timestamp: new Date().getTime(),
      }),
    ]);

    groups = await firstValueFrom(spectator.service['tabGroups$']);

    expect(groups.length).toBe(4);

    [group1] = groups;

    expect(group1.tabs.length).toBe(1);
  });

  it('should sync collections', async () => {
    let groups = await firstValueFrom(spectator.service['tabGroups$']);

    expect(groups.length).toBe(3);

    const mock = getTabGroupMock();

    await spectator.service['syncCollections']({
      '0c7b96b3-b457-4208-bff9-a249177c1e03': {
        newValue: [mock.timestamp, tabsToSync(mock.tabs)],
      },
    });

    groups = await firstValueFrom(spectator.service['tabGroups$']);

    expect(groups.length).toBe(4);
  });

  it('should generate timeline', async () => {
    const timeline = await firstValueFrom(spectator.service.groupsTimeline$);

    expect(timeline).toBeDefined();

    expect(timeline.length).toBeGreaterThan(0);
    expect(timeline[0].elements.length).toBeGreaterThan(0);
    expect(timeline[0].label).toBeDefined();
  });

  it('should remove groups', async () => {
    let groups = await firstValueFrom(spectator.service['tabGroups$']);

    await spectator.service.removeTabGroups(groups);

    groups = await firstValueFrom(spectator.service['tabGroups$']);
    expect(groups).toBeNull();
  });

  it('should remove group', async () => {
    let groups = await firstValueFrom(spectator.service['tabGroups$']);

    expect(groups.length).toBe(3);

    await spectator.service.removeTabGroup(groups[0]);
    groups = await firstValueFrom(spectator.service['tabGroups$']);

    expect(groups.length).toBe(2);
  });
});
