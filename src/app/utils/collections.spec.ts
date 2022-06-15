import { getTabGroupMock, getTabGroupsMock } from 'src/mocks';
import { getCollections, saveCollections, syncToTabs, tabsToSync } from './collections';

describe('collections.ts', () => {
  const syncedData = {
    favicon: {
      'duckduckgo.com': 'https://duckduckgo.com/favicon.ico',
      'getfedora.org': 'https://getfedora.org/static/images/favicon.ico',
      'github.com': 'https://github.githubassets.com/favicons/favicon.svg',
      'linuxmint.com': 'https://linuxmint.com/web/img/favicon.ico',
      'ubuntu.com': 'https://assets.ubuntu.com/v1/49a1a858-favicon-32x32.png',
      'www.apple.com': 'https://www.apple.com/favicon.ico',
      'www.google.com': 'https://www.google.com/favicon.ico',
      'www.microsoft.com': 'https://c.s-microsoft.com/favicon.ico?v2',
    },
    '6ab9c99e-8942-4236-ad6e-7e38c51da810': [
      1650847781791,
      [
        [218, 'https://getfedora.org/', 'Fedora', false],
        [220, 'https://ubuntu.com/', 'Enterprise Open Source and Linux | Ubuntu', false],
        [222, 'https://www.microsoft.com/en-us/', 'Microsoft – Cloud, Computers, Apps & Gaming', false],
        [224, 'https://www.google.com/', 'Google', false],
      ],
    ],
    '7dd29b1c-dfab-44d4-8d29-76d402d24038': [
      1650858932558,
      [
        [57, 'https://ubuntu.com/', 'Enterprise Open Source and Linux | Ubuntu', false],
        [58, 'https://ubuntu.com/', 'Enterprise Open Source and Linux | Ubuntu', false],
        [61, 'https://linuxmint.com/', 'Home - Linux Mint', false],
        [
          63,
          'https://www.microsoft.com/en-us/windows?r=1',
          'Explore Windows 11 OS, Computers, Apps, & More | Microsoft',
          false,
        ],
        [64, 'https://www.apple.com/', 'Apple', false],
      ],
    ],
    'e200698d-d053-45f7-b917-e03b104ae127': [
      1650858875455,
      [
        [51, 'https://github.com/', 'GitHub: Where the world builds software · GitHub', false],
        [52, 'https://duckduckgo.com/', 'DuckDuckGo — Privacy, simplified.', false],
      ],
    ],
  };

  it('should convert synced tabs', () => {
    const collection = getTabGroupMock();
    const tabs = tabsToSync(collection.tabs);

    expect(tabs).toEqual([
      [51, 'https://github.com/', 'GitHub: Where the world builds software · GitHub', false],
      [52, 'https://duckduckgo.com/', 'DuckDuckGo — Privacy, simplified.', false],
    ]);

    expect(syncToTabs(tabs)).toEqual([
      {
        id: 51,
        title: 'GitHub: Where the world builds software · GitHub',
        url: 'https://github.com/',
        pinned: false,
      },
      {
        id: 52,
        title: 'DuckDuckGo — Privacy, simplified.',
        url: 'https://duckduckgo.com/',
        pinned: false,
      },
    ]);
  });

  it('should save tab groups to storage', async () => {
    const getSyncSpy = jest.spyOn<any, any>(chrome.storage.sync, 'get');
    getSyncSpy.mockReturnValue({ '07297efc-2629-47dc-abf3-c8612781600f': [] });

    const setSyncSpy = jest.spyOn(chrome.storage.sync, 'set');
    const remSyncSpy = jest.spyOn(chrome.storage.sync, 'remove');

    await saveCollections(getTabGroupsMock());

    expect(remSyncSpy).toHaveBeenCalled();
    expect(setSyncSpy).toHaveBeenCalledWith(expect.objectContaining(syncedData));
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
            favIconUrl: 'https://getfedora.org/static/images/favicon.ico',
            id: 218,
            pinned: false,
            title: 'Fedora',
            url: 'https://getfedora.org/',
          },
          {
            favIconUrl: 'https://assets.ubuntu.com/v1/49a1a858-favicon-32x32.png',
            id: 220,
            pinned: false,
            title: 'Enterprise Open Source and Linux | Ubuntu',
            url: 'https://ubuntu.com/',
          },
          {
            favIconUrl: 'https://c.s-microsoft.com/favicon.ico?v2',
            id: 222,
            pinned: false,
            title: 'Microsoft – Cloud, Computers, Apps & Gaming',
            url: 'https://www.microsoft.com/en-us/',
          },
          {
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
            favIconUrl: 'https://assets.ubuntu.com/v1/49a1a858-favicon-32x32.png',
            id: 57,
            pinned: false,
            title: 'Enterprise Open Source and Linux | Ubuntu',
            url: 'https://ubuntu.com/',
          },
          {
            favIconUrl: 'https://assets.ubuntu.com/v1/49a1a858-favicon-32x32.png',
            id: 58,
            pinned: false,
            title: 'Enterprise Open Source and Linux | Ubuntu',
            url: 'https://ubuntu.com/',
          },
          {
            favIconUrl: 'https://linuxmint.com/web/img/favicon.ico',
            id: 61,
            pinned: false,
            title: 'Home - Linux Mint',
            url: 'https://linuxmint.com/',
          },
          {
            favIconUrl: 'https://c.s-microsoft.com/favicon.ico?v2',
            id: 63,
            pinned: false,
            title: 'Explore Windows 11 OS, Computers, Apps, & More | Microsoft',
            url: 'https://www.microsoft.com/en-us/windows?r=1',
          },
          {
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
            favIconUrl: 'https://github.githubassets.com/favicons/favicon.svg',
            id: 51,
            pinned: false,
            title: 'GitHub: Where the world builds software · GitHub',
            url: 'https://github.com/',
          },
          {
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
