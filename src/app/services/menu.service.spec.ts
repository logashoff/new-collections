import { waitForAsync } from '@angular/core/testing';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { take } from 'rxjs/operators';
import { Action, MenuService } from './menu.service';
import { TabService } from './tab.service';

jest.mock('src/app/utils', () => ({
  importTabs: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(0))),
  getSavedTabs: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(0))),
  queryCurrentWindow: jest.fn().mockImplementation(
    () =>
      new Promise((resolve) =>
        resolve([
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
        ])
      )
  ),
}));

describe('MenuService', () => {
  const tabGroup = {
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
  };
  
  let spectator: SpectatorService<MenuService>;
  const createService = createServiceFactory({
    service: MenuService,
    providers: [
      {
        provide: TabService,
        useValue: {
          createTabGroup: () => new Promise((resolve) => resolve(tabGroup)),
          displayMessage() {},
          saveTabGroup: () => new Promise((resolve) => resolve(0)),
          saveTabGroups() {},
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

  it('should return 4 actions', waitForAsync(() => {
    spectator.service.menuItems$.pipe(take(1)).subscribe((actions) => {
      expect(actions.length).toBe(4);
      expect(actions).toEqual([
        {
          id: 4,
          icon: 'bookmark',
          tooltip: 'Save',
          tooltipPosition: 'left',
          color: 'accent',
        },
        {
          id: 1,
          icon: 'download',
          tooltip: 'Export',
          tooltipPosition: 'left',
        },
        {
          id: 2,
          icon: 'file_upload',
          tooltip: 'Import',
          tooltipPosition: 'left',
        },
        {
          id: 3,
          icon: 'settings',
          tooltip: 'Options',
          tooltipPosition: 'left',
        },
      ]);
    });
  }));

  it('should handle actions', async () => {
    const service = spectator.service['tabsService'];

    const openOptionsPageSpy = jest.spyOn(chrome.runtime, 'openOptionsPage');
    const createTabGroupSpy = jest.spyOn(service, 'createTabGroup');
    const saveTabGroupsSpy = jest.spyOn(service, 'saveTabGroups');
    const saveTabGroupSpy = jest.spyOn(service, 'saveTabGroup');

    await spectator.service.handleMenuAction(Action.Save);
    expect(service.createTabGroup).toHaveBeenCalledTimes(1);
    expect(service.saveTabGroup).toHaveBeenCalledTimes(1);
    expect(chrome.runtime.openOptionsPage).toHaveBeenCalledTimes(1);

    openOptionsPageSpy.mockClear();
    saveTabGroupSpy.mockClear();
    createTabGroupSpy.mockClear();

    await spectator.service.handleMenuAction(Action.Options);
    expect(chrome.runtime.openOptionsPage).toHaveBeenCalledTimes(1);

    openOptionsPageSpy.mockClear();

    await spectator.service.handleMenuAction(Action.Import);
    expect(service.saveTabGroups).toHaveBeenCalledTimes(1);

    saveTabGroupsSpy.mockClear();
  });
});
