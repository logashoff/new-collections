import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { firstValueFrom, of } from 'rxjs';
import { getBrowserTabsMock, getTabGroupsMock } from 'src/mocks';
import { v4 as uuidv4 } from 'uuid';
import { ignoreUrlsRegExp } from '../utils/models';
import { getHostname } from '../utils/tab';
import { TabService } from './tab.service';

jest.mock('src/app/utils', () => ({
  getSavedTabs: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(getTabGroupsMock()))),
  queryTabs: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(getBrowserTabsMock))),
  queryCurrentWindow: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(getBrowserTabsMock()))),
  removeTab: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(0))),
  saveTabGroups: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(0))),
  ignoreUrlsRegExp,
  getHostname,
}));

describe('TabService', () => {
  let spectator: SpectatorService<TabService>;
  const createService = createServiceFactory({
    service: TabService,
    imports: [MatSnackBarModule],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: {
          queryParams: of({
            groupId: '7dd29b1c-dfab-44d4-8d29-76d402d24038',
          }),
        },
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
    const tabGroups = await firstValueFrom(spectator.service.tabGroups$);

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
    const tabGroup = await spectator.service.createTabGroup(getBrowserTabsMock());
    await spectator.service.addTabGroup(tabGroup);

    const tabGroups = spectator.service['tabGroupsSource$'].value;

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
    const tabGroups = await firstValueFrom(spectator.service.tabGroups$);

    expect(tabGroups.length).toBe(3);

    const [g1, g2, g3] = tabGroups;

    const hostnameGroups = await firstValueFrom(spectator.service.tabsByHostname$);

    expect(hostnameGroups[g1.id].length).toBe(4);
    expect(hostnameGroups[g2.id].length).toBe(2);
    expect(hostnameGroups[g3.id].length).toBe(4);
  });

  it('should update tab and icon groups list when tab is removed', async () => {
    const [group1] = await firstValueFrom(spectator.service.tabGroups$);
    const [ubuntuTab1, ubuntuTab2, mintTab] = group1.tabs;

    let hostnameGroups = await firstValueFrom(spectator.service.tabsByHostname$);
    expect(hostnameGroups[group1.id].length).toBe(4);

    await spectator.service.removeTab(ubuntuTab1);
    hostnameGroups = await firstValueFrom(spectator.service.tabsByHostname$);
    expect(hostnameGroups[group1.id].length).toBe(4);
    expect(group1.tabs.length).toBe(4);

    await spectator.service.removeTab(ubuntuTab2);
    hostnameGroups = await firstValueFrom(spectator.service.tabsByHostname$);
    expect(hostnameGroups[group1.id].length).toBe(3);
    expect(group1.tabs.length).toBe(3);

    await spectator.service.removeTab(mintTab);
    hostnameGroups = await firstValueFrom(spectator.service.tabsByHostname$);
    expect(hostnameGroups[group1.id].length).toBe(2);
    expect(group1.tabs.length).toBe(2);
  });

  it('should merge new tab groups with current ones', async () => {
    let groups = await firstValueFrom(spectator.service.tabGroups$);

    expect(groups.length).toBe(3);

    let [group1, group2, group3] = groups;

    expect(group1.tabs.length).toBe(5);
    expect(group2.tabs.length).toBe(2);
    expect(group3.tabs.length).toBe(4);

    await spectator.service.addTabGroups(getTabGroupsMock());

    groups = await firstValueFrom(spectator.service.tabGroups$);

    expect(groups.length).toBe(3);

    [group1, group2, group3] = groups;

    expect(group1.tabs.length).toBe(5);
    expect(group2.tabs.length).toBe(2);
    expect(group3.tabs.length).toBe(4);

    await spectator.service.addTabGroups([
      {
        id: 'e200698d-d053-45f7-b917-e03b104ae127',
        tabs: [
          {
            favIconUrl: 'https://github.githubassets.com/favicons/favicon.svg',
            id: 51,
            title: 'GitHub: Where the world builds software · GitHub',
            url: 'https://github.com/',
            pinned: false,
            active: false,
          },
          {
            favIconUrl: 'https://duckduckgo.com/favicon.ico',
            id: 52,
            title: 'DuckDuckGo — Privacy, simplified.',
            url: 'https://duckduckgo.com/',
            pinned: false,
            active: false,
          },
          {
            favIconUrl: 'https://duckduckgo.com/favicon.ico',
            id: 53,
            title: 'DuckDuckGo — Privacy, simplified.',
            url: 'https://duckduckgo.com/',
            pinned: false,
            active: false,
          },
        ],
        timestamp: 1650858875455,
      },
    ]);

    groups = await firstValueFrom(spectator.service.tabGroups$);

    expect(groups.length).toBe(3);

    [group1, group2, group3] = groups;

    expect(group2.tabs.length).toBe(3);

    await spectator.service.addTabGroups([
      {
        id: uuidv4(),
        tabs: [
          {
            favIconUrl: 'https://github.githubassets.com/favicons/favicon.svg',
            id: 123,
            title: 'GitHub: Where the world builds software · GitHub',
            url: 'https://github.com/',
            pinned: false,
            active: false,
          },
        ],
        timestamp: new Date().getTime(),
      },
    ]);

    groups = await firstValueFrom(spectator.service.tabGroups$);

    expect(groups.length).toBe(4);

    [group1] = groups;

    expect(group1.tabs.length).toBe(1);
  });
});
