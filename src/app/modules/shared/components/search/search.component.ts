import { Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import isNil from 'lodash/isNil';
import { firstValueFrom, lastValueFrom, map, Observable, shareReplay, startWith, tap, withLatestFrom } from 'rxjs';
import { NavService, SearchService, TabService } from 'src/app/services';
import { BrowserTab, BrowserTabs, TabDelete, trackByTabId } from 'src/app/utils';

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
  readonly formGroup = new FormGroup({
    search: new FormControl(''),
  });

  readonly trackByTabId = trackByTabId;

  /**
   * Indicates there is data to search.
   */
  readonly hasSearchData$: Observable<boolean> = this.searchService.hasSearchData$;

  /**
   * Source for search results.
   */
  readonly searchResults$: Observable<BrowserTabs> = this.formGroup.valueChanges.pipe(
    startWith({ search: '' }),
    tap(() => this.navService.reset()),
    withLatestFrom(this.searchService.fuzzy$),
    map(([{ search }, fuzzy]) => (search?.length > 0 ? fuzzy.search(search)?.map(({ item }) => item) : null)),
    shareReplay(1)
  );

  /**
   * Indicates search results state
   */
  readonly hasSearchValue$: Observable<boolean> = this.searchResults$.pipe(
    map((searchResult) => !isNil(searchResult)),
    shareReplay(1)
  );

  constructor(private navService: NavService, private searchService: SearchService, private tabService: TabService) {}

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

  /**
   * Handles list item click event
   */
  async resultsClickHandler(tab: BrowserTab) {
    const group = await this.tabService.getGroupByTab(tab);

    this.clearSearch();

    this.navService.setParams(group.id, tab.id);
  }
}
