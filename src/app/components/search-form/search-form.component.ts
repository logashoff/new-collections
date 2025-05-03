import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnInit,
  output,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BehaviorSubject, filter, map, shareReplay } from 'rxjs';

import { TranslatePipe } from '../../pipes';
import { CollectionsService, NavService } from '../../services';
import { Action, ESC_KEY_CODE, scrollTop } from '../../utils';

/**
 * Search input form.
 */
interface SearchForm {
  search: FormControl<string>;
}

@Component({
  selector: 'nc-search-form',
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    AsyncPipe,
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
    '[class.disabled]': 'disabled',
    '[class.is-active]': 'isActive',
    '[class.is-focused]': 'isFocused',
  },
})
export class SearchFormComponent implements OnInit {
  readonly activated = output();
  readonly canceled = output();
  readonly blurred = output();

  #disabled = false;

  @Input()
  set disabled(disabled: boolean) {
    if (disabled) {
      this.#searchControl.disable();
    } else {
      this.#searchControl.enable();
    }

    this.#disabled = disabled;
  }

  get disabled(): boolean {
    return this.#disabled;
  }

  private readonly searchInput = viewChild.required<ElementRef>('searchInput');

  readonly Action = Action;
  readonly #searchControl = new FormControl<string>('');
  readonly formGroup = new FormGroup<SearchForm>({
    search: this.#searchControl,
  });

  readonly #formValues$ = this.formGroup.valueChanges.pipe(takeUntilDestroyed(), shareReplay(1));

  /**
   * Indicates search input is focused
   */
  readonly focused$ = new BehaviorSubject<boolean>(false);

  get isActive() {
    return this.navService.isActive('search');
  }

  get isFocused() {
    return this.focused$.value;
  }

  readonly isActive$ = this.navService.pathChanges$.pipe(
    map(() => this.isActive),
    shareReplay(1)
  );

  readonly #activated$ = this.focused$.pipe(
    takeUntilDestroyed(),
    filter((focused) => focused && !this.isActive)
  );

  readonly #searchParams$ = this.navService.paramsSearch$.pipe(takeUntilDestroyed(), shareReplay(1));

  constructor(
    private collectionsService: CollectionsService,
    private navService: NavService
  ) {}

  ngOnInit() {
    this.#searchParams$.subscribe((value) =>
      this.#searchControl.setValue(value, {
        emitEvent: false,
      })
    );

    this.#activated$.subscribe(() => this.activated.emit());

    this.#formValues$.subscribe(({ search }) => this.searchChange(search));
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
    this.collectionsService.handleAction(action);
  }

  onBlur() {
    this.focused$.next(false);
    this.blurred.emit();
  }

  async searchChange(value: string) {
    await this.navService.search(value);
    scrollTop({ top: 0 });
  }
}
