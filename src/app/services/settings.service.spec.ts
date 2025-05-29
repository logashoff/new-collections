import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MostVisitedURL, Settings } from '../utils';
import { SettingsService } from './settings.service';
import { chrome } from 'src/mocks';

vi.stubGlobal('chrome', chrome);

describe('SettingsService', () => {
  let spectator: SpectatorService<SettingsService>;
  const createService = createServiceFactory({
    service: SettingsService,
    providers: [
      provideZonelessChangeDetection(),
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
      ignoreTopSites: [
        {
          title: 'Site 1',
          url: 'https://site1.org',
        },
      ],
    });
  });
});
