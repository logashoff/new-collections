import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
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
import { Subscription } from 'rxjs';
import { CollectionsService } from 'src/app/services';
import { Action } from 'src/app/utils';

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
    TranslateModule,
  ],
})
export class SearchFormComponent implements OnInit, OnDestroy {
  Action = Action;

  readonly formGroup: FormGroup<SearchForm>;

  private readonly searchControl = new FormControl<string>('');

  private valueChanges: Subscription;

  /**
   * Emits value when search input changes
   */
  @Output() readonly changed = new EventEmitter<string>();

  @Input() set search(value: string) {
    this.searchControl.setValue(value, {
      emitEvent: false,
    });
  }

  /**
   * Indicates search input is focused
   */
  focused = false;

  @HostBinding('class.has-value') get hasValue() {
    return this.search?.length > 0 || this.focused;
  }

  get search(): string {
    return this.searchControl.value;
  }

  constructor(private collectionsService: CollectionsService) {
    this.formGroup = new FormGroup<SearchForm>({
      search: this.searchControl,
    });
  }

  ngOnInit() {
    this.valueChanges = this.formGroup.valueChanges.subscribe(({ search }) => this.changed.emit(search));
  }

  ngOnDestroy() {
    this.valueChanges.unsubscribe();
  }

  /**
   * Clears search input
   */
  clearSearch() {
    this.searchControl.setValue('');
  }

  handleAction(action: Action) {
    this.collectionsService.handleAction(action);
  }
}
