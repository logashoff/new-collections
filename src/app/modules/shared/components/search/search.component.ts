import { Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { isNil } from 'lodash';
import { map, Observable, shareReplay, startWith, tap, withLatestFrom } from 'rxjs';
import { NavService, SearchService, TabService } from 'src/app/services';
import { BrowserTab } from 'src/app/utils';

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

  /**
   * Source for search results.
   */
  readonly searchResults$ = this.formGroup.valueChanges.pipe(
    startWith({ search: '' }),
    map(({ search }) => search),
    tap(() => this.navService.reset()),
    withLatestFrom(this.searchService.fuse$),
    map(([search, fuse]) => (search?.length > 0 ? fuse.search(search) : null)),
    map((results) => results?.map(({ item }) => item) ?? null),
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
   * Handles list item click event
   */
  async resultsClickHandler(tab: BrowserTab) {
    const group = await this.tabService.getGroupByTab(tab);

    this.clearSearch();

    this.navService.setParams(group.id, tab.id);
  }
}
