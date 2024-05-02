import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CollectionsService, NavService } from 'src/app/services';
import { Action } from 'src/app/utils';
import { StopPropagationDirective } from '../../directives';

/**
 * Search input form.
 */
interface SearchForm {
  search: FormControl<string>;
}

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    ReactiveFormsModule,
    StopPropagationDirective,
    TranslateModule,
  ],
})
export class SearchFormComponent implements OnInit, OnDestroy {
  readonly Action = Action;
  readonly #searchControl = new FormControl<string>('');
  readonly formGroup = new FormGroup<SearchForm>({
    search: this.#searchControl,
  });

  #valueChanges: Subscription;

  /**
   * Indicates search input is focused
   */
  readonly focused$ = new BehaviorSubject<boolean>(false);

  @HostBinding('class.is-active') get hasValue() {
    return this.search?.length > 0 || this.focused$.value;
  }

  get search(): string {
    return this.#searchControl.value;
  }

  constructor(
    private collectionsService: CollectionsService,
    private navService: NavService
  ) {}

  ngOnInit() {
    this.#valueChanges = this.formGroup.valueChanges.subscribe(({ search }) => this.searchChange(search));
  }

  ngOnDestroy() {
    this.#valueChanges.unsubscribe();
  }

  /**
   * Clears search input
   */
  clearSearch() {
    this.#searchControl.setValue('');
  }

  handleAction(action: Action) {
    this.collectionsService.handleAction(action);
  }

  searchChange(value: string) {
    if (value) {
      this.navService.search(value);
    } else {
      this.navService.reset();
    }

    document.body.scrollTo(0, 0);
  }
}
