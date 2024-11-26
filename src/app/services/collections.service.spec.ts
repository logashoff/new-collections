import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { getBrowserTabMock, getTabGroupsMock, MessageServiceMock, NavServiceMock, TabServiceMock } from 'src/mocks';
import { Action, ActionIcon, ignoreUrlsRegExp, TabGroup } from '../utils/models';
import { openOptions } from 'src/app/utils';
import { CollectionsService } from './collections.service';
import { MessageService } from './message.service';
import { NavService } from './nav.service';
import { TabService } from './tab.service';

jest.mock('src/app/utils', () => ({
  getCollections: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(0))),
  importTabs: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(0))),
  queryCurrentWindow: jest.fn().mockImplementation(() => new Promise((resolve) => resolve([getBrowserTabMock()]))),
  translate: jest.fn().mockImplementation(() => (str) => str),
  openOptions: jest.fn().mockImplementation(() => {}),
  Action,
  ActionIcon,
  TabGroup,
  ignoreUrlsRegExp,
}));

describe('CollectionsService', () => {
  let spectator: SpectatorService<CollectionsService>;
  const createService = createServiceFactory({
    service: CollectionsService,
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

  it('should handle actions', async () => {
    const tabsService = spectator.inject(TabService);

    const createTabGroupSpy = jest.spyOn(tabsService, 'createTabGroup');
    const saveTabGroupsSpy = jest.spyOn(tabsService, 'addTabGroups');
    const saveTabGroupSpy = jest.spyOn(tabsService, 'addTabGroup');

    await spectator.service.handleAction(Action.Save);
    expect(tabsService.createTabGroup).toHaveBeenCalledTimes(1);
    expect(tabsService.addTabGroup).toHaveBeenCalledTimes(1);

    saveTabGroupSpy.mockClear();
    createTabGroupSpy.mockClear();

    await spectator.service.handleAction(Action.Settings);
    expect(openOptions).toHaveBeenCalledTimes(1);

    await spectator.service.handleAction(Action.Import);
    expect(tabsService.addTabGroups).toHaveBeenCalledTimes(1);

    saveTabGroupsSpy.mockClear();
  });
});
