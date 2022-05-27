import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { MostVisitedURL, Settings } from '../utils';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let spectator: SpectatorService<SettingsService>;
  const createService = createServiceFactory({
    service: SettingsService,
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
      ignoreTopSites: [site],
    });
  });

  it('should update current settings', async () => {
    const savedSettings: Settings = {
      enableDevices: true,
      enableTopSites: true,
    };

    jest.spyOn<any, any>(spectator.service, 'getSettings').mockReturnValue(savedSettings);

    const updateSettings: Settings = {
      ignoreTopSites: [
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
