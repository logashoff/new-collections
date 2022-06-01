import { getBrowserTabMock, getTabGroupMock, getTabGroupsMock } from 'src/mocks';
import { getCollections, getHostname, getUrlOrigin, saveCollections, syncToTabs, tabsToSync } from './collections';
import { SyncData } from './models';

describe('collections.ts', () => {
  const syncedData: SyncData = {
    '6ab9c99e-8942-4236-ad6e-7e38c51da810': [
      1650847781791,
      [
        [218, 'https://getfedora.org/', 'https://getfedora.org/static/images/favicon.ico', 'Fedora', false, false],
        [
          220,
          'https://ubuntu.com/',
          'https://assets.ubuntu.com/v1/49a1a858-favicon-32x32.png',
          'Enterprise Open Source and Linux | Ubuntu',
          false,
          false,
        ],
        [
          222,
          'https://www.microsoft.com/en-us/',
          'https://c.s-microsoft.com/favicon.ico?v2',
          'Microsoft – Cloud, Computers, Apps & Gaming',
          false,
          false,
        ],
        [224, 'https://www.google.com/', 'https://www.google.com/favicon.ico', 'Google', false, false],
      ],
    ],
    '7dd29b1c-dfab-44d4-8d29-76d402d24038': [
      1650858932558,
      [
        [
          57,
          'https://ubuntu.com/',
          'https://assets.ubuntu.com/v1/49a1a858-favicon-32x32.png',
          'Enterprise Open Source and Linux | Ubuntu',
          false,
          false,
        ],
        [
          58,
          'https://ubuntu.com/',
          'https://assets.ubuntu.com/v1/49a1a858-favicon-32x32.png',
          'Enterprise Open Source and Linux | Ubuntu',
          false,
          false,
        ],
        [61, 'https://linuxmint.com/', 'https://linuxmint.com/web/img/favicon.ico', 'Home - Linux Mint', false, false],
        [
          63,
          'https://www.microsoft.com/en-us/windows?r=1',
          'https://c.s-microsoft.com/favicon.ico',
          'Explore Windows 11 OS, Computers, Apps, & More | Microsoft',
          false,
          false,
        ],
        [64, 'https://www.apple.com/', 'https://www.apple.com/favicon.ico', 'Apple', false, false],
      ],
    ],
    'e200698d-d053-45f7-b917-e03b104ae127': [
      1650858875455,
      [
        [
          51,
          'https://github.com/',
          'https://github.githubassets.com/favicons/favicon.svg',
          'GitHub: Where the world builds software · GitHub',
          false,
          false,
        ],
        [
          52,
          'https://duckduckgo.com/',
          'https://duckduckgo.com/favicon.ico',
          'DuckDuckGo — Privacy, simplified.',
          false,
          false,
        ],
      ],
    ],
  };

  it('should convert synced tabs', () => {
    const collection = getTabGroupMock();
    const tabs = tabsToSync(collection.tabs);

    expect(tabs).toEqual([
      [
        51,
        'https://github.com/',
        'https://github.githubassets.com/favicons/favicon.svg',
        'GitHub: Where the world builds software · GitHub',
        false,
        false,
      ],
      [
        52,
        'https://duckduckgo.com/',
        'https://duckduckgo.com/favicon.ico',
        'DuckDuckGo — Privacy, simplified.',
        false,
        false,
      ],
    ]);

    expect(syncToTabs(tabs)).toEqual(collection.tabs);
  });

  it('should return hostname', () => {
    expect(getHostname(getBrowserTabMock())).toBe('getfedora.org');
  });

  it('should return origin', () => {
    expect(getUrlOrigin('https://developer.chrome.com/docs/extensions/mv3/manifest/')).toBe(
      'https://developer.chrome.com'
    );
  });

  it('should save tab groups to storage', async () => {
    const getSyncSpy = jest.spyOn<any, any>(chrome.storage.sync, 'get');
    getSyncSpy.mockReturnValue({ '07297efc-2629-47dc-abf3-c8612781600f': [] });

    const setSyncSpy = jest.spyOn(chrome.storage.sync, 'set');
    const remSyncSpy = jest.spyOn(chrome.storage.sync, 'remove');

    await saveCollections(getTabGroupsMock());

    expect(remSyncSpy).toHaveBeenCalled();
    expect(setSyncSpy).toHaveBeenCalledWith(syncedData);
  });

  it('should return tab groups from storage', async () => {
    const getSyncSpy = jest.spyOn<any, any>(chrome.storage.sync, 'get');
    getSyncSpy.mockReturnValue(syncedData);

    const collections = await getCollections();

    expect(collections).toEqual([
      {
        id: '6ab9c99e-8942-4236-ad6e-7e38c51da810',
        tabs: [
          {
            active: false,
            favIconUrl: 'https://getfedora.org/static/images/favicon.ico',
            id: 218,
            pinned: false,
            title: 'Fedora',
            url: 'https://getfedora.org/',
          },
          {
            active: false,
            favIconUrl: 'https://assets.ubuntu.com/v1/49a1a858-favicon-32x32.png',
            id: 220,
            pinned: false,
            title: 'Enterprise Open Source and Linux | Ubuntu',
            url: 'https://ubuntu.com/',
          },
          {
            active: false,
            favIconUrl: 'https://c.s-microsoft.com/favicon.ico?v2',
            id: 222,
            pinned: false,
            title: 'Microsoft – Cloud, Computers, Apps & Gaming',
            url: 'https://www.microsoft.com/en-us/',
          },
          {
            active: false,
            favIconUrl: 'https://www.google.com/favicon.ico',
            id: 224,
            pinned: false,
            title: 'Google',
            url: 'https://www.google.com/',
          },
        ],
        timestamp: 1650847781791,
      },
      {
        id: '7dd29b1c-dfab-44d4-8d29-76d402d24038',
        tabs: [
          {
            active: false,
            favIconUrl: 'https://assets.ubuntu.com/v1/49a1a858-favicon-32x32.png',
            id: 57,
            pinned: false,
            title: 'Enterprise Open Source and Linux | Ubuntu',
            url: 'https://ubuntu.com/',
          },
          {
            active: false,
            favIconUrl: 'https://assets.ubuntu.com/v1/49a1a858-favicon-32x32.png',
            id: 58,
            pinned: false,
            title: 'Enterprise Open Source and Linux | Ubuntu',
            url: 'https://ubuntu.com/',
          },
          {
            active: false,
            favIconUrl: 'https://linuxmint.com/web/img/favicon.ico',
            id: 61,
            pinned: false,
            title: 'Home - Linux Mint',
            url: 'https://linuxmint.com/',
          },
          {
            active: false,
            favIconUrl: 'https://c.s-microsoft.com/favicon.ico',
            id: 63,
            pinned: false,
            title: 'Explore Windows 11 OS, Computers, Apps, & More | Microsoft',
            url: 'https://www.microsoft.com/en-us/windows?r=1',
          },
          {
            active: false,
            favIconUrl: 'https://www.apple.com/favicon.ico',
            id: 64,
            pinned: false,
            title: 'Apple',
            url: 'https://www.apple.com/',
          },
        ],
        timestamp: 1650858932558,
      },
      {
        id: 'e200698d-d053-45f7-b917-e03b104ae127',
        tabs: [
          {
            active: false,
            favIconUrl: 'https://github.githubassets.com/favicons/favicon.svg',
            id: 51,
            pinned: false,
            title: 'GitHub: Where the world builds software · GitHub',
            url: 'https://github.com/',
          },
          {
            active: false,
            favIconUrl: 'https://duckduckgo.com/favicon.ico',
            id: 52,
            pinned: false,
            title: 'DuckDuckGo — Privacy, simplified.',
            url: 'https://duckduckgo.com/',
          },
        ],
        timestamp: 1650858875455,
      },
    ]);
  });
});
