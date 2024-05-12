import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Subject, filter, map, shareReplay, takeUntil } from 'rxjs';
import { StopPropagationDirective } from '../../directives/index';
import { CollectionsService, NavService } from '../../services/index';
import { Action, scrollTop } from '../../utils/index';

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
    CommonModule,
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
  @Output() readonly activated = new EventEmitter();
  @Output() readonly canceled = new EventEmitter();

  readonly Action = Action;
  readonly #searchControl = new FormControl<string>('');
  readonly formGroup = new FormGroup<SearchForm>({
    search: this.#searchControl,
  });

  readonly #destroy$ = new Subject();

  /**
   * Indicates search input is focused
   */
  readonly focused$ = new BehaviorSubject<boolean>(false);

  @HostBinding('class.is-active') get isActive() {
    return this.navService.isActive('search');
  }

  @HostBinding('class.is-focused') get isFocused() {
    return this.focused$.value;
  }

  get search(): string {
    return this.#searchControl.value;
  }

  readonly isActive$ = this.navService.pathChanges$.pipe(
    map(() => this.navService.isActive('search')),
    shareReplay(1)
  );

  constructor(
    private collectionsService: CollectionsService,
    private navService: NavService
  ) {}

  ngOnInit() {
    this.navService.paramsSearch$.pipe(takeUntil(this.#destroy$)).subscribe((value) =>
      this.#searchControl.setValue(value, {
        emitEvent: false,
      })
    );

    this.focused$
      .pipe(
        takeUntil(this.#destroy$),
        filter((focused) => focused && !this.isActive)
      )
      .subscribe(() => this.activated.emit());

    this.formGroup.valueChanges.pipe(takeUntil(this.#destroy$)).subscribe(({ search }) => this.searchChange(search));
  }

  ngOnDestroy() {
    this.#destroy$.next(null);
    this.#destroy$.complete();
  }

  /**
   * Clears search input
   */
  clearSearch() {
    this.canceled.emit();
  }

  handleAction(action: Action) {
    this.collectionsService.handleAction(action);
  }

  async searchChange(value: string) {
    await this.navService.search(value);
    scrollTop({ top: 0 });
  }
}
