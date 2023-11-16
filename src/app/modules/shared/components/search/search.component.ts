import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import Fuse from 'fuse.js';
import isNil from 'lodash/isNil';
import { BehaviorSubject, Observable, firstValueFrom, lastValueFrom, map, shareReplay, withLatestFrom } from 'rxjs';
import { NavService } from 'src/app/services';
import { Action, BrowserTab, BrowserTabs, TabDelete } from 'src/app/utils';

const fuseOptions: Fuse.IFuseOptions<BrowserTab> = {
  keys: ['title', 'url'],
  threshold: 0.33,
  includeMatches: false,
  ignoreLocation: true,
};

/**
 * @description
 *
 * Search form component
 */
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SearchComponent implements OnInit {
  Action = Action;

  private readonly source$ = new BehaviorSubject<BrowserTabs>([]);

  @Input() set source(value: BrowserTabs) {
    this.source$.next(value);
  }

  get source(): BrowserTabs {
    return this.source$.value;
  }

  /**
   * Indicates search data is present.
   */
  readonly hasSearchData$: Observable<boolean> = this.source$.pipe(
    map((source) => source?.length > 0),
    shareReplay(1)
  );

  /**
   * Returns Fuse search instance.
   */
  private readonly fuse$: Observable<Fuse<BrowserTab>> = this.source$.pipe(
    map((source) => new Fuse(source ?? [], fuseOptions)),
    shareReplay(1)
  );

  /**
   * Source for search results.
   */
  readonly searchResults$: Observable<Fuse.FuseResult<BrowserTab>[]>;

  /**
   * Tabs data from search results
   */
  readonly tabs$: Observable<BrowserTab[]>;

  /**
   * Indicates search results state
   */
  readonly hasSearchValue$: Observable<boolean>;

  readonly searchValue$: Observable<string>;

  constructor(private navService: NavService) {
    this.searchValue$ = this.navService.paramsSearch$.pipe(shareReplay(1));

    this.searchResults$ = this.searchValue$.pipe(
      withLatestFrom(this.fuse$),
      map(([search, fuse]) => (search?.length > 0 ? fuse.search(search) : null)),
      shareReplay(1)
    );

    this.tabs$ = this.searchResults$.pipe(
      map((searchResults) => searchResults?.map(({ item }) => item)),
      shareReplay(1)
    );

    this.hasSearchValue$ = this.searchResults$.pipe(
      map((searchResult) => !isNil(searchResult)),
      shareReplay(1)
    );
  }

  ngOnInit(): void {
    this.navService.reset();
  }

  /**
   * Handles tab update
   */
  async itemModified(updatedTab: BrowserTab) {
    const tabs = await firstValueFrom(this.tabs$);

    if (updatedTab && !tabs.includes(updatedTab)) {
      const index = tabs.findIndex((t) => t.id === updatedTab.id);

      if (index > -1) {
        tabs.splice(index, 1, updatedTab);
      }
    }
  }

  /**
   * Handles tab deletion
   */
  async itemDeleted({ deletedTab, revertDelete }: TabDelete) {
    const tabs = await firstValueFrom(this.tabs$);

    let index = tabs.findIndex((tab) => tab === deletedTab);
    if (revertDelete && index > -1) {
      tabs.splice(index, 1);

      const { dismissedByAction: undo } = await lastValueFrom(revertDelete.afterDismissed());

      if (undo) {
        tabs.splice(index, 0, deletedTab);
      }
    }
  }

  searchChange(value: string) {
    if (value) {
      this.navService.search(value);
    } else {
      this.navService.reset();
    }

    scrollTo(0, 0);
  }
}
