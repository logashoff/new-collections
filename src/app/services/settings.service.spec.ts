import { Router } from '@angular/router';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { MostVisitedURL, Settings } from '../utils/index';
import { SettingsService } from './settings.service';

jest.mock('src/app/utils', () => ({
  getSettings: jest.fn().mockImplementation(
    () =>
      new Promise((resolve) =>
        resolve({
          enableDevices: true,
          enableTopSites: true,
        })
      )
  ),
}));

describe('SettingsService', () => {
  let spectator: SpectatorService<SettingsService>;
  const createService = createServiceFactory({
    service: SettingsService,
    providers: [
      {
        provide: Router,
        useValue: {
          url: '/new-tab',
        },
      },
    ],
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should handle empty settings', async () => {
    const site: MostVisitedURL = {
      title: 'New Site',
      url: 'https://site.com',
    };

    const newSettings = await spectator.service.ignoreSite(site);

    expect(newSettings).toEqual({
      enableDevices: true,
      enableTopSites: true,
      ignoreTopSites: [site],
    });
  });

  it('should update current settings', async () => {
    const updateSettings: Settings = {
      ignoreTopSites: [
        {
          title: 'Site 1',
          url: 'https://site1.org',
        },
        {
          title: 'Site 1',
          url: 'https://site1.org',
        },
        {
          title: 'Site 1',
          url: 'https://site1.org',
        },
      ],
    };

    const newSettings = await spectator.service.update(updateSettings);

    expect(newSettings).toEqual({
      enableDevices: true,
      enableTopSites: true,
      ignoreTopSites: [
        {
          title: 'Site 1',
          url: 'https://site1.org',
        },
      ],
    });
  });
});
