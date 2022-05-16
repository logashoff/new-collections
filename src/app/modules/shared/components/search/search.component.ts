import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isNil } from 'lodash';
import { map, Observable, shareReplay } from 'rxjs';
import { SearchService, TabService } from 'src/app/services';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  constructor(
    private activeRoute: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private tabService: TabService
  ) {}

  ngOnInit(): void {
    this.formGroup.valueChanges.subscribe(({ search }) => {
      this.searchService.search(search);
      this.router.navigate([], {
        relativeTo: this.activeRoute,
        queryParams: {
          groupId: undefined,
          tabId: undefined,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
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

    this.router.navigate([], {
      relativeTo: this.activeRoute,
      queryParams: {
        groupId: group.id,
        tabId: tab.id,
      },
      replaceUrl: true,
    });
  }
}
