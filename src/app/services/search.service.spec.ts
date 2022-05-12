import { waitForAsync } from '@angular/core/testing';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { of, take } from 'rxjs';
import { tabGroupsMock } from 'src/mocks';
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
          tabGroups$: of(tabGroupsMock),
        },
      },
    ],
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should return results', waitForAsync(() => {
    spectator.service.search('fedora');

    spectator.service.searchResults$.pipe(take(1)).subscribe((searchResults) => {
      expect(searchResults).toBeDefined();
      expect(searchResults.length).toBeGreaterThan(0);
      expect(searchResults[0]).toHaveProperty('title');
      expect(searchResults[0]).toHaveProperty('url');
    });
  }));
});
