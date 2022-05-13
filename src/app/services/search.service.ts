import { Injectable } from '@angular/core';
import Fuse from 'fuse.js';
import { flatMap } from 'lodash';
import { BehaviorSubject, map, Observable, withLatestFrom } from 'rxjs';
import { BrowserTab } from '../utils';
import { TabService } from './tab.service';

/**
 * Fuse.js options.
 */
const fuseOptions: Fuse.IFuseOptions<BrowserTab> = {
  keys: ['title', 'url'],
  threshold: 0.5,
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

  private readonly tabs$: Observable<BrowserTab[]> = this.tabService.tabGroups$.pipe(
    map((tabGroups) => flatMap(tabGroups, (tabGroup) => tabGroup.tabs))
  );

  /**
   * Returns Fuse search instance.
   */
  private readonly fuseSearch$: Observable<Fuse<BrowserTab>> = this.tabs$.pipe(
    map((tabs) => new Fuse(tabs, fuseOptions))
  );

  /**
   * Returns search results based on search component input.
   */
  readonly searchResults$: Observable<BrowserTab[]> = this.searchValue$.pipe(
    withLatestFrom(this.fuseSearch$),
    map(([searchValue, fuseSearch]) => (searchValue?.length > 0 ? fuseSearch.search(searchValue) : null)),
    map((results) => results?.map(({ item }) => item) ?? null)
  );

  constructor(private tabService: TabService) {}

  /**
   * Filters loaded tabs list by value specified.
   */
  search(value: string) {
    this.searchValue$.next(value);
  }
}
