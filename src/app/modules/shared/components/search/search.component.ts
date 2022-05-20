import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { isNil } from 'lodash';
import { map, Observable, shareReplay } from 'rxjs';
import { SearchService, TabService, NavService } from 'src/app/services';
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
export class SearchComponent implements OnInit {
  readonly formGroup = new FormGroup({
    search: new FormControl(''),
  });

  /**
   * Source for search results.
   */
  readonly searchResults$ = this.searchService.searchResults$;

  /**
   * Indicates search results state
   */
  readonly hasSearchValue$: Observable<boolean> = this.searchResults$.pipe(
    map((searchResult) => !isNil(searchResult)),
    shareReplay(1)
  );

  constructor(private navService: NavService, private searchService: SearchService, private tabService: TabService) {}

  ngOnInit(): void {
    this.formGroup.valueChanges.subscribe(({ search }) => {
      this.searchService.search(search);
      this.navService.clear();
    });
  }

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

    this.navService.go(group.id, tab.id);
  }
}
