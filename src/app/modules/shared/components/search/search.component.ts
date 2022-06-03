import { Component, Input, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import Fuse from 'fuse.js';
import isNil from 'lodash/isNil';
import {
  BehaviorSubject,
  firstValueFrom,
  lastValueFrom,
  map,
  Observable,
  shareReplay,
  startWith,
  tap,
  withLatestFrom,
} from 'rxjs';
import { NavService } from 'src/app/services';
import { BrowserTab, BrowserTabs, TabDelete, trackByTabId } from 'src/app/utils';

const fuseOptions: Fuse.IFuseOptions<BrowserTab> = {
  keys: ['title', 'url'],
  threshold: 0.5,
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
export class SearchComponent {
  private readonly source$ = new BehaviorSubject<BrowserTabs>([]);

  @Input() set source(value: BrowserTabs) {
    this.source$.next(value);
  }

  get source(): BrowserTabs {
    return this.source$.value;
  }

  readonly formGroup = new FormGroup({
    search: new FormControl(''),
  });

  readonly trackByTabId = trackByTabId;

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
  readonly searchResults$: Observable<BrowserTabs> = this.formGroup.valueChanges.pipe(
    startWith({ search: '' }),
    tap(() => this.navService.reset()),
    withLatestFrom(this.fuse$),
    map(([{ search }, fuse]) => (search?.length > 0 ? fuse.search(search)?.map(({ item }) => item) : null)),
    shareReplay(1)
  );

  /**
   * Indicates search results state
   */
  readonly hasSearchValue$: Observable<boolean> = this.searchResults$.pipe(
    map((searchResult) => !isNil(searchResult)),
    shareReplay(1)
  );

  constructor(private navService: NavService) {}

  /**
   * Clears search input
   */
  clearSearch() {
    this.formGroup.get('search').setValue('');
  }

  /**
   * Handles tab update
   */
  async itemModified(updatedTab: BrowserTab) {
    const tabs = await firstValueFrom(this.searchResults$);

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
    const tabs = await firstValueFrom(this.searchResults$);

    let index = tabs.findIndex((tab) => tab === deletedTab);
    if (revertDelete && index > -1) {
      tabs.splice(index, 1);

      const { dismissedByAction: undo } = await lastValueFrom(revertDelete.afterDismissed());

      if (undo) {
        tabs.splice(index, 0, deletedTab);
      }
    }
  }
}
