import { waitForAsync } from '@angular/core/testing';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { take } from 'rxjs/operators';
import { Action, MenuService } from './menu.service';
import { TabService } from './tab.service';

jest.mock('src/app/utils');

describe('MenuService', () => {
  let spectator: SpectatorService<MenuService>;
  const createService = createServiceFactory({
    service: MenuService,
    providers: [
      {
        provide: TabService,
        useValue: {
          saveCurrentWindowTabs() {},
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

  it(
    'should return 4 actions',
    waitForAsync(() => {
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
    })
  );

  it('should handle actions', async () => {
    jest.spyOn(chrome.runtime, 'openOptionsPage').mockImplementation();
    jest.spyOn(spectator.service['tabsService'], 'saveCurrentWindowTabs').mockImplementation();
    jest.spyOn(spectator.service['tabsService'], 'saveTabGroups').mockImplementation();

    await spectator.service.handleMenuAction(Action.Save);
    await spectator.service.handleMenuAction(Action.Options);
    await spectator.service.handleMenuAction(Action.Import);

    expect(chrome.runtime.openOptionsPage).toHaveBeenCalledTimes(2);
    expect(spectator.service['tabsService'].saveCurrentWindowTabs).toHaveBeenCalledTimes(1);
    expect(spectator.service['tabsService'].saveTabGroups).toHaveBeenCalledTimes(1);
  });
});
