import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let spectator: SpectatorService<SettingsService>;
  const createService = createServiceFactory({
    service: SettingsService,
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should return settings', () => {});
});
