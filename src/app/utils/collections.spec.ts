import { getTabGroupMock, getTabGroupsMock } from 'src/mocks';
import { addRecent, getCollections, removeRecent, saveCollections, syncToTabs, tabsToSync } from './collections';
import { RecentSync, SyncStorageArea } from './models';

describe('collections.ts', () => {
  const setSyncSpy = jest.spyOn(chrome.storage.sync, 'set');
  const remSyncSpy = jest.spyOn(chrome.storage.sync, 'remove');
  const getSyncSpy = jest.spyOn<SyncStorageArea, 'get'>(chrome.storage.sync, 'get');

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-11-15'));
  });

  beforeEach(() => {
    setSyncSpy.mockReset();
    remSyncSpy.mockReset();
    getSyncSpy.mockReset();
  });

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
        [218, 'https://getfedora.org/', 'Fedora'],
        [220, 'https://ubuntu.com/', 'Enterprise Open Source and Linux | Ubuntu'],
        [222, 'https://www.microsoft.com/en-us/', 'Microsoft – Cloud, Computers, Apps & Gaming'],
        [224, 'https://www.google.com/', 'Google'],
      ],
    ],
    '7dd29b1c-dfab-44d4-8d29-76d402d24038': [
      1650858932558,
      [
        [57, 'https://ubuntu.com/', 'Enterprise Open Source and Linux | Ubuntu'],
        [58, 'https://ubuntu.com/', 'Enterprise Open Source and Linux | Ubuntu'],
        [61, 'https://linuxmint.com/', 'Home - Linux Mint'],
        [
          63,
          'https://www.microsoft.com/en-us/windows?r=1',
          'Explore Windows 11 OS, Computers, Apps, & More | Microsoft',
        ],
        [64, 'https://www.apple.com/', 'Apple'],
      ],
    ],
    'e200698d-d053-45f7-b917-e03b104ae127': [
      1650858875455,
      [
        [51, 'https://github.com/', 'GitHub: Where the world builds software · GitHub'],
        [52, 'https://duckduckgo.com/', 'DuckDuckGo — Privacy, simplified.'],
      ],
    ],
  };

  it('should convert synced tabs', () => {
    const collection = getTabGroupMock();
    const tabs = tabsToSync(collection.tabs);

    expect(tabs).toEqual([
      [51, 'https://github.com/', 'GitHub: Where the world builds software · GitHub'],
      [52, 'https://duckduckgo.com/', 'DuckDuckGo — Privacy, simplified.'],
    ]);

    expect(syncToTabs(tabs)).toEqual([
      {
        id: 51,
        title: 'GitHub: Where the world builds software · GitHub',
        url: 'https://github.com/',
      },
      {
        id: 52,
        title: 'DuckDuckGo — Privacy, simplified.',
        url: 'https://duckduckgo.com/',
      },
    ]);
  });

  it('should save tab groups to storage', async () => {
    await saveCollections(getTabGroupsMock());

    expect(remSyncSpy).toHaveBeenCalled();
    expect(setSyncSpy).toHaveBeenCalledWith(expect.objectContaining(syncedData));
  });

  it('should return tab groups from storage', async () => {
    getSyncSpy.mockImplementation(() => syncedData);

    const collections = await getCollections();

    expect(collections).toEqual([
      {
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
      {
        id: '7dd29b1c-dfab-44d4-8d29-76d402d24038',
        tabs: [
          {
            favIconUrl: 'https://assets.ubuntu.com/v1/49a1a858-favicon-32x32.png',
            id: 57,
            title: 'Enterprise Open Source and Linux | Ubuntu',
            url: 'https://ubuntu.com/',
          },
          {
            favIconUrl: 'https://assets.ubuntu.com/v1/49a1a858-favicon-32x32.png',
            id: 58,
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
            favIconUrl: 'https://c.s-microsoft.com/favicon.ico?v2',
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
    ]);
  });

  it('should delete recent when over limit', async () => {
    setSyncSpy.mockReset();
    remSyncSpy.mockReset();
    getSyncSpy.mockReset();

    const length = 100;

    const keys = Array.from({ length }).map((v, i) => i + 1);
    const recent = {};
    keys.forEach((key) => (recent[key] = key));

    getSyncSpy.mockImplementation(() => ({
      recent,
    }));

    await addRecent(...[5, 6, 7, 8]);

    const callArgs: RecentSync = setSyncSpy.mock.calls[0][0];

    const recentKeys = Object.keys(callArgs.recent);

    const currentTime = new Date().getTime();

    expect(recentKeys.length).toBe(length);
    expect(recent[5]).toBeDefined();
    expect(recent[5]).toEqual(currentTime);
    expect(recent[6]).toBeDefined();
    expect(recent[6]).toEqual(currentTime);
    expect(recent[7]).toBeDefined();
    expect(recent[7]).toEqual(currentTime);
    expect(recent[8]).toBeDefined();
    expect(recent[8]).toEqual(currentTime);
  });

  it('should remove recent', async () => {
    getSyncSpy.mockReset();
    setSyncSpy.mockReset();

    getSyncSpy.mockImplementation(() => ({
      recent: {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
      },
    }));

    await removeRecent([5, 1, 6, 7]);

    expect(setSyncSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        recent: {
          2: 2,
          3: 3,
          4: 4,
          8: 8,
          9: 9,
        },
      })
    );
  });
});
