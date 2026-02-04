import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { disabled, FormField, form } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { distinctUntilChanged, map, shareReplay } from 'rxjs';

import { TranslatePipe } from '../../pipes';
import { CollectionsService, NavService } from '../../services';
import { Action, ESC_KEY_CODE, scrollTop } from '../../utils';

/**
 * Search input form.
 */
interface SearchModel {
  search: string;
}

@Component({
  selector: 'nc-search-form',
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    AsyncPipe,
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  host: {
    '(document:keyup.escape)': 'onKeyUp($event)',
    '[class.disabled]': 'disabled()',
    '[class.is-active]': 'isActive',
    '[class.is-focused]': 'focused()',
  },
})
export class SearchFormComponent {
  readonly #collectionsService = inject(CollectionsService);
  readonly #navService = inject(NavService);

  readonly activated = output();
  readonly blurred = output();
  readonly canceled = output();

  readonly disabled = input<boolean>(false);

  private readonly searchInput = viewChild.required<ElementRef>('searchInput');

  readonly Action = Action;

  readonly searchModel = signal<SearchModel>({
    search: '',
  });

  readonly searchForm = form(this.searchModel, (schemaPath) => {
    disabled(schemaPath.search, () => this.disabled());
  });

  /**
   * Indicates search input is focused
   */
  readonly focused = signal<boolean>(false);

  get isActive() {
    return this.#navService.isActive('search');
  }

  readonly isActive$ = this.#navService.pathChanges$.pipe(
    map(() => this.isActive),
    shareReplay(1)
  );

  readonly #activated = computed<boolean>(() => this.focused() && !this.isActive);

  constructor() {
    effect(() => {
      if (this.#activated()) {
        this.activated.emit();
      }
    });

    this.#navService.paramsSearch$.pipe(distinctUntilChanged(), takeUntilDestroyed()).subscribe((query) => {
      const { value } = this.searchForm.search();

      if (typeof query === 'string' && value() !== query) {
        value.set(query);
      } else if (!query) {
        value.set('');
      }
    });

    toObservable(this.searchModel)
      .pipe(
        takeUntilDestroyed(),
        map(({ search }) => search),
        distinctUntilChanged()
      )
      .subscribe((search) => {
        if (this.isActive) {
          void this.searchChange(search);
        }
      });
  }

  onKeyUp(e: KeyboardEvent) {
    if (e.code === ESC_KEY_CODE && this.isActive) {
      this.clearSearch();
    }
  }

  /**
   * Clears search input
   */
  clearSearch() {
    if (this.isActive) {
      this.canceled.emit();
      this.searchInput().nativeElement.blur();
    }
  }

  handleAction(action: Action) {
    void this.#collectionsService.handleAction(action);
  }

  onBlur() {
    this.focused.set(false);
    this.blurred.emit();
  }

  async searchChange(value: string) {
    await this.#navService.search(value);
    scrollTop({ top: 0 });
  }

  onSubmit(e: Event) {
    e.preventDefault();
  }
}
