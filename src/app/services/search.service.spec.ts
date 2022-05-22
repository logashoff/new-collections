import { waitForAsync } from '@angular/core/testing';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { map, of, switchMap, take } from 'rxjs';
import { getTabGroupsMock } from 'src/mocks';
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
          tabGroups$: of(getTabGroupsMock()),
        },
      },
    ],
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should return results', waitForAsync(() => {
    of('fedora')
      .pipe(switchMap((search) => spectator.service.fuse$.pipe(map((fuse) => fuse.search(search)))))
      .pipe(take(1))
      .subscribe((searchResults) => {
        expect(searchResults).toBeDefined();
        expect(searchResults.length).toBeGreaterThan(0);

        const [{ item }] = searchResults;
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('url');
        expect(item.title).toBe('Fedora');
        expect(item.url).toBe('https://getfedora.org/');
      });
  }));
});
