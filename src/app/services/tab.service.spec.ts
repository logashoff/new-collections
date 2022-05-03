import { waitForAsync } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { lastValueFrom } from 'rxjs';
import { ignoreUrlsRegExp } from '../utils/models';
import { TabService } from './tab.service';

const tabGroupsJson = [
  {
    domains: [
      {
        count: 1,
        icon: 'https://assets.ubuntu.com/v1/49a1a858-favicon-32x32.png',
        name: 'ubuntu.com',
      },
      {
        count: 1,
        icon: 'https://linuxmint.com/web/img/favicon.ico',
        name: 'linuxmint.com',
      },
      {
        count: 1,
        icon: 'https://c.s-microsoft.com/favicon.ico',
        name: 'www.microsoft.com',
      },
      {
        count: 1,
        icon: 'https://www.apple.com/favicon.ico',
        name: 'www.apple.com',
      },
    ],
    id: '7dd29b1c-dfab-44d4-8d29-76d402d24038',
    tabs: [
      {
        favIconUrl: 'https://assets.ubuntu.com/v1/49a1a858-favicon-32x32.png',
        id: 57,
        title: 'Enterprise Open Source and Linux | Ubuntu',
        url: 'https://ubuntu.com/',
      },
      {
        favIconUrl: 'https://linuxmint.com/web/img/favicon.ico',
        id: 61,
        title: 'Home - Linux Mint',
        url: 'https://linuxmint.com/',
      },
      {
        favIconUrl: 'https://c.s-microsoft.com/favicon.ico',
        id: 63,
        title: 'Explore Windows 11 OS, Computers, Apps, & More | Microsoft',
        url: 'https://www.microsoft.com/en-us/windows?r=1',
      },
      {
        favIconUrl: 'https://www.apple.com/favicon.ico',
        id: 64,
        title: 'Apple',
        url: 'https://www.apple.com/',
      },
    ],
    timestamp: 1650858932558,
  },
  {
    domains: [
      {
        count: 1,
        icon: 'https://github.githubassets.com/favicons/favicon.svg',
        name: 'github.com',
      },
      {
        count: 1,
        icon: 'https://duckduckgo.com/favicon.ico',
        name: 'duckduckgo.com',
      },
    ],
    id: 'e200698d-d053-45f7-b917-e03b104ae127',
    tabs: [
      {
        favIconUrl: 'https://github.githubassets.com/favicons/favicon.svg',
        id: 51,
        title: 'GitHub: Where the world builds software · GitHub',
        url: 'https://github.com/',
      },
      {
        favIconUrl: 'https://duckduckgo.com/favicon.ico',
        id: 52,
        title: 'DuckDuckGo — Privacy, simplified.',
        url: 'https://duckduckgo.com/',
      },
    ],
    timestamp: 1650858875455,
  },
  {
    domains: [
      {
        count: 1,
        icon: 'https://getfedora.org/static/images/favicon.ico',
        name: 'getfedora.org',
      },
      {
        count: 1,
        icon: 'https://assets.ubuntu.com/v1/49a1a858-favicon-32x32.png',
        name: 'ubuntu.com',
      },
      {
        count: 1,
        icon: 'https://c.s-microsoft.com/favicon.ico?v2',
        name: 'www.microsoft.com',
      },
      {
        count: 1,
        icon: 'https://www.google.com/favicon.ico',
        name: 'www.google.com',
      },
    ],
    id: '6ab9c99e-8942-4236-ad6e-7e38c51da810',
    tabs: [
      {
        favIconUrl: 'https://getfedora.org/static/images/favicon.ico',
        id: 218,
        title: 'Fedora',
        url: 'https://getfedora.org/',
      },
      {
        favIconUrl: 'https://assets.ubuntu.com/v1/49a1a858-favicon-32x32.png',
        id: 220,
        title: 'Enterprise Open Source and Linux | Ubuntu',
        url: 'https://ubuntu.com/',
      },
      {
        favIconUrl: 'https://c.s-microsoft.com/favicon.ico?v2',
        id: 222,
        title: 'Microsoft – Cloud, Computers, Apps & Gaming',
        url: 'https://www.microsoft.com/en-us/',
      },
      {
        favIconUrl: 'https://www.google.com/favicon.ico',
        id: 224,
        title: 'Google',
        url: 'https://www.google.com/',
      },
    ],
    timestamp: 1650847781791,
  },
];

const windowTabs = [
  {
    active: true,
    audible: false,
    autoDiscardable: true,
    discarded: false,
    favIconUrl: '',
    groupId: -1,
    height: 698,
    highlighted: true,
    id: 2,
    incognito: false,
    index: 0,
    mutedInfo: {
      muted: false,
    },
    pinned: false,
    selected: true,
    status: 'complete',
    title: 'Extensions',
    url: 'chrome://extensions/',
    width: 1188,
    windowId: 1,
  },
  {
    active: false,
    audible: false,
    autoDiscardable: true,
    discarded: false,
    favIconUrl: 'https://about.gitlab.com/nuxt-images/ico/favicon.ico?cache=20220414',
    groupId: -1,
    height: 698,
    highlighted: false,
    id: 48,
    incognito: false,
    index: 1,
    mutedInfo: {
      muted: false,
    },
    pinned: false,
    selected: false,
    status: 'complete',
    title: 'GitLab - The One DevOps Platform',
    url: 'https://about.gitlab.com/',
    width: 1188,
    windowId: 1,
  },
  {
    active: false,
    audible: false,
    autoDiscardable: true,
    discarded: false,
    favIconUrl: 'https://github.githubassets.com/favicons/favicon.svg',
    groupId: -1,
    height: 698,
    highlighted: false,
    id: 49,
    incognito: false,
    index: 2,
    mutedInfo: {
      muted: false,
    },
    pinned: false,
    selected: false,
    status: 'complete',
    title: 'GitHub: Where the world builds software · GitHub',
    url: 'https://github.com/',
    width: 1188,
    windowId: 1,
  },
  {
    active: false,
    audible: false,
    autoDiscardable: true,
    discarded: false,
    favIconUrl: 'https://getfedora.org/static/images/favicon.ico',
    groupId: -1,
    height: 698,
    highlighted: false,
    id: 50,
    incognito: false,
    index: 3,
    mutedInfo: {
      muted: false,
    },
    pinned: false,
    selected: false,
    status: 'complete',
    title: 'Fedora',
    url: 'https://getfedora.org/',
    width: 1188,
    windowId: 1,
  },
];

jest.mock('src/app/utils', () => ({
  getDomainsFromTabs: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(0))),
  getSavedTabs: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(tabGroupsJson))),
  queryTabs: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(windowTabs))),
  queryCurrentWindow: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(windowTabs))),
  removeTab: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(0))),
  saveTabGroups: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(0))),
  ignoreUrlsRegExp: ignoreUrlsRegExp,
}));

describe('TabService', () => {
  let spectator: SpectatorService<TabService>;
  const createService = createServiceFactory({
    service: TabService,
    imports: [MatSnackBarModule],
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should be created', () => {
    expect(spectator.service).toBeTruthy();
  });

  it('should initialize tabs', waitForAsync(async () => {
    const tabs = await lastValueFrom(spectator.service.tabGroups$);

    expect(tabs.length).toBe(3);
    expect(tabs[0].tabs.length).toBe(4);
    expect(tabs[1].tabs.length).toBe(2);
    expect(tabs[2].tabs.length).toBe(4);
  }));

  it('should generate tab group', async () => {
    const tabGroup = await spectator.service.getTabGroup(windowTabs);

    expect(tabGroup.tabs.length).toBe(3);
  });

  it('should save tab group', async () => {
    const tabGroup = await spectator.service.getTabGroup(windowTabs);
    await spectator.service.saveTabGroup(tabGroup);

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
});
