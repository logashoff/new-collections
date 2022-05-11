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
   * Returns search results from search component.
   */
  readonly searchResults$: Observable<BrowserTab[]> = combineLatest([
    this.searchValue$,
    this.tabService.tabGroups$,
  ]).pipe(
    map(([searchValue, tabGroups]) => {
      const tabs: BrowserTab[] = flatMap(tabGroups, (tabGroup) => tabGroup.tabs);
      const fuse = new Fuse(tabs, fuseOptions);
      const searchResults: BrowserTab[] = fuse.search(searchValue).map((res) => res.item);

      return searchResults?.length > 0 ? searchResults : searchValue?.length ? [] : null;
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
