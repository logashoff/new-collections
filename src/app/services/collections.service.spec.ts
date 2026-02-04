import { provideZonelessChangeDetection } from '@angular/core';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import {
  getBrowserApi,
  getBrowserTabsMock,
  getTabGroupsMock,
  MessageServiceMock,
  NavServiceMock,
  TabServiceMock,
} from 'src/mocks';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Action } from '../utils/models';
import { CollectionsService } from './collections.service';
import { MessageService } from './message.service';
import { NavService } from './nav.service';
import { TabService } from './tab.service';

describe('CollectionsService', () => {
  let spectator: SpectatorService<CollectionsService>;
  const createService = createServiceFactory({
    service: CollectionsService,
    providers: [
      provideZonelessChangeDetection(),
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

  let browserApi: ReturnType<typeof getBrowserApi>;

  beforeEach(() => {
    browserApi = getBrowserApi(getBrowserTabsMock());
    vi.stubGlobal('chrome', browserApi);

    spectator = createService();
    spectator.service['importCollections'] = vi.fn().mockImplementation(() => [getTabGroupsMock()]);
  });

  it('should be created', () => {
    expect(spectator.service).toBeTruthy();
  });

  it('should handle actions', async () => {
    const tabsService = spectator.inject(TabService);

    const createTabGroupSpy = vi.spyOn(tabsService, 'createTabGroup');
    const saveTabGroupsSpy = vi.spyOn(tabsService, 'addTabGroups');
    const saveTabGroupSpy = vi.spyOn(tabsService, 'addTabGroup');

    await spectator.service.handleAction(Action.Save);
    expect(tabsService.createTabGroup).toHaveBeenCalledTimes(1);
    expect(tabsService.addTabGroup).toHaveBeenCalledTimes(1);

    saveTabGroupSpy.mockClear();
    createTabGroupSpy.mockClear();

    vi.spyOn(browserApi.runtime, 'openOptionsPage');
    await spectator.service.handleAction(Action.Settings);
    expect(browserApi.runtime.openOptionsPage).toHaveBeenCalledTimes(1);

    await spectator.service.handleAction(Action.Import);
    expect(tabsService.addTabGroups).toHaveBeenCalledTimes(1);

    saveTabGroupsSpy.mockClear();
  });
});
