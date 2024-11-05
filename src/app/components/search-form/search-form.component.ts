import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  OnInit,
  output,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BehaviorSubject, filter, fromEvent, map, shareReplay } from 'rxjs';

import { StopPropagationDirective, SubSinkDirective } from '../../directives';
import { TranslatePipe } from '../../pipes';
import { CollectionsService, NavService } from '../../services';
import { Action, ESC_KEY_CODE, KEY_UP, scrollTop } from '../../utils';

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
    TranslatePipe,
  ],
})
export class SearchFormComponent extends SubSinkDirective implements OnInit {
  readonly activated = output();
  readonly canceled = output();
  readonly blur = output();

  private readonly searchInput = viewChild.required<ElementRef>('searchInput');

  readonly Action = Action;
  readonly #searchControl = new FormControl<string>('');
  readonly formGroup = new FormGroup<SearchForm>({
    search: this.#searchControl,
  });

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
    map(() => this.isActive),
    shareReplay(1)
  );

  constructor(
    private collectionsService: CollectionsService,
    private navService: NavService
  ) {
    super();
  }

  ngOnInit() {
    const paramChanges = this.navService.paramsSearch$.subscribe((value) =>
      this.#searchControl.setValue(value, {
        emitEvent: false,
      })
    );

    const keyEvent$ = fromEvent<KeyboardEvent>(document, KEY_UP);

    const keyChanges = keyEvent$.subscribe((e) => {
      if (e.code === ESC_KEY_CODE && this.isActive) {
        this.clearSearch();
      }
    });

    const focusChanges = this.focused$
      .pipe(filter((focused) => focused && !this.isActive))
      .subscribe(() => this.activated.emit());

    this.formGroup.valueChanges.subscribe(({ search }) => this.searchChange(search));

    this.subscribe(paramChanges, keyChanges, focusChanges);
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
    this.blur.emit();
  }

  async searchChange(value: string) {
    await this.navService.search(value);
    scrollTop({ top: 0 });
  }
}
