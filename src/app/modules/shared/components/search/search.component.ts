import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
   * Indicates search results state
   */
  readonly hasSearchValue$: Observable<boolean> = this.searchService.searchResults$.pipe(
    map((searchResult) => !!searchResult),
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
