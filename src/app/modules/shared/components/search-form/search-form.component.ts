import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
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
export class SearchFormComponent implements OnInit {
  Action = Action;

  readonly formGroup: FormGroup<SearchForm>;

  private readonly searchControl = new FormControl<string>('');

  @Output() readonly changed = new EventEmitter<string>();

  @Input() set search(value: string) {
    this.searchControl.setValue(value, {
      emitEvent: false,
    });
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
    this.formGroup.valueChanges.subscribe(({ search }) => this.changed.emit(search));
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
