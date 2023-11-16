import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
  styleUrls: ['./search-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
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
