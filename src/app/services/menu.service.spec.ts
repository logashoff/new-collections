import { waitForAsync } from '@angular/core/testing';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { take } from 'rxjs/operators';
import { getBrowserTabMock, getTabGroupsMock, MessageServiceMock, NavServiceMock, TabServiceMock } from 'src/mocks';
import { Action, ActionIcon, ignoreUrlsRegExp, TabGroup } from '../utils/models';
import { MenuService } from './menu.service';
import { MessageService } from './message.service';
import { NavService } from './nav.service';
import { TabService } from './tab.service';

jest.mock('src/app/utils', () => ({
  getCollections: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(0))),
  importTabs: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(0))),
  queryCurrentWindow: jest.fn().mockImplementation(() => new Promise((resolve) => resolve([getBrowserTabMock()]))),
  translate: jest.fn().mockImplementation(() => (str) => str),
  usesDarkMode: jest.fn().mockImplementation(() => {}),
  Action,
  ActionIcon,
  TabGroup,
  ignoreUrlsRegExp,
}));

describe('MenuService', () => {
  let spectator: SpectatorService<MenuService>;
  const createService = createServiceFactory({
    service: MenuService,
    providers: [
      {
        provide: TabService,
        useClass: TabServiceMock,
      },
      {
        provide: MessageService,
        useClass: MessageServiceMock,
      },
      {
        provide: NavService,
        useClass: NavServiceMock,
      },
    ],
  });

  beforeEach(() => {
    spectator = createService();
    spectator.service['importCollections'] = jest
      .fn()
      .mockImplementation(() => new Promise((resolve) => resolve([getTabGroupsMock()])));
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
          icon: 'bookmark_add',
          tooltip: 'addBookmarks',
          tooltipPosition: 'left',
          color: 'accent',
        },
        {
          id: 1,
          icon: 'save_alt',
          tooltip: 'exportCollections',
          tooltipPosition: 'left',
        },
        {
          id: 2,
          icon: 'file_upload',
          tooltip: 'importCollections',
          tooltipPosition: 'left',
        },
        {
          id: 3,
          icon: 'settings',
          tooltip: 'settings',
          tooltipPosition: 'left',
        },
      ]);
    });
  }));

  it('should handle actions', async () => {
    const tabsService = spectator.service['tabsService'];

    const openOptionsPageSpy = jest.spyOn(chrome.runtime, 'openOptionsPage');
    const createTabGroupSpy = jest.spyOn(tabsService, 'createTabGroup');
    const saveTabGroupsSpy = jest.spyOn(tabsService, 'addTabGroups');
    const saveTabGroupSpy = jest.spyOn(tabsService, 'addTabGroup');

    await spectator.service.handleMenuAction(Action.Save);
    expect(tabsService.createTabGroup).toHaveBeenCalledTimes(1);
    expect(tabsService.addTabGroup).toHaveBeenCalledTimes(1);

    openOptionsPageSpy.mockClear();
    saveTabGroupSpy.mockClear();
    createTabGroupSpy.mockClear();

    await spectator.service.handleMenuAction(Action.Settings);
    expect(chrome.runtime.openOptionsPage).toHaveBeenCalledTimes(1);

    openOptionsPageSpy.mockClear();

    await spectator.service.handleMenuAction(Action.Import);
    expect(tabsService.addTabGroups).toHaveBeenCalledTimes(1);

    saveTabGroupsSpy.mockClear();
  });
});
