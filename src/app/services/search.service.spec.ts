import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { SearchService } from './search.service';
import { TabService } from './tab.service';

describe('SearchService', () => {
  let spectator: SpectatorService<SearchService>;
  const createService = createServiceFactory({
    service: SearchService,
    providers: [
      {
        provide: TabService,
        useValue: {
          createTabGroup: () => new Promise((resolve) => resolve(0)),
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

  it('should return results', () => {

  });
});
