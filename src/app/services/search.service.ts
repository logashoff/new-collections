import { Injectable } from '@angular/core';
import Fuse from 'fuse.js';
import { flatMap } from 'lodash';
import { BehaviorSubject, combineLatest, map, Observable, shareReplay } from 'rxjs';
import { BrowserTab } from '../utils';
import { TabService } from './tab.service';

/**
 * Fuse.js options.
 */
const fuseOptions: Fuse.IFuseOptions<BrowserTab> = {
  keys: ['title', 'url'],
  threshold: 0.55,
};

/**
 * @description
 *
 * Search service used be search component.
 */
@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private readonly searchValue$ = new BehaviorSubject<string>('');

  /**
   * Returns Fuse search instance.
   */
  private readonly fuseSearch$: Observable<Fuse<BrowserTab>> = this.tabService.tabGroups$.pipe(
    map(
      (tabGroups) =>
        new Fuse(
          flatMap(tabGroups, (tabGroup) => tabGroup.tabs),
          fuseOptions
        )
    ),
    shareReplay(1)
  );

  /**
   * Returns search results based on search component input.
   */
  readonly searchResults$: Observable<BrowserTab[]> = combineLatest([this.searchValue$, this.fuseSearch$]).pipe(
    map(([searchValue, fuseSearch]) => {
      if (searchValue?.length > 0) {
        const searchResults: BrowserTab[] = fuseSearch.search(searchValue).map((res) => res.item);
        return searchResults;
      }

      return null;
    }),
    shareReplay(1)
  );

  constructor(private tabService: TabService) {}

  /**
   * Filters loaded tabs list by value specified.
   */
  search(value: string) {
    this.searchValue$.next(value);
  }
}
