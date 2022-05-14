import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { isNil } from 'lodash';
import { map, Observable, shareReplay } from 'rxjs';
import { SearchService } from 'src/app/services';

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

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    this.formGroup.valueChanges.subscribe(({ search }) => this.searchService.search(search));
  }

  /**
   * Clears search input
   */
  clearSearch() {
    this.formGroup.get('search').setValue('');
  }
}
