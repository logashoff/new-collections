import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { isNil } from 'lodash-es';
import { Observable, filter, map, shareReplay, startWith, withLatestFrom } from 'rxjs';
import { Tabs } from '../../utils/index';

import { FaviconPipe, HostnamePipe } from '../../pipes/index';
import { ChipComponent } from '../chip/chip.component';
import { LabelComponent } from '../label/label.component';

/**
 * Form for selecting new tabs to add to existing or new group.
 */
interface TabSelectorForm {
  list: FormControl<Tabs>;
}

/**
 * @description
 *
 * Bottom sheet for selecting specified tabs.
 */
@Component({
  selector: 'app-tabs-selector',
  templateUrl: './tabs-selector.component.html',
  styleUrl: './tabs-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    ChipComponent,
    CommonModule,
    FaviconPipe,
    HostnamePipe,
    LabelComponent,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
})
export class TabsSelectorComponent {
  /**
   * Root group form.
   */
  readonly formGroup = new FormGroup<TabSelectorForm>({
    list: new FormControl([], [Validators.required, Validators.minLength(1)]),
  });

  /**
   * List of checked items.
   */
  private readonly checkList$: Observable<Tabs> = this.formGroup.valueChanges.pipe(
    filter((values) => !isNil(values)),
    map(({ list }) => list),
    shareReplay(1)
  );

  /**
   * Number of items selected in the list.
   */
  readonly selectionLength$: Observable<number> = this.checkList$.pipe(
    startWith([]),
    map((list) => list?.length ?? 0),
    shareReplay(1)
  );

  /**
   * True if all list items are selected.
   */
  readonly allSelected$: Observable<boolean> = this.selectionLength$.pipe(
    map((len) => len === this.tabs.length),
    shareReplay(1)
  );

  /**
   * True if any list items are selected.
   */
  readonly someSelected$: Observable<boolean> = this.checkList$.pipe(
    withLatestFrom(this.allSelected$),
    map(([list, allSelected]) => list.length > 0 && !allSelected)
  );

  /**
   * Reference to list component.
   */
  @ViewChild(MatSelectionList) private listComponent: MatSelectionList;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) readonly tabs: Tabs,
    private bottomSheetRef: MatBottomSheetRef<TabsSelectorComponent>
  ) {}

  /**
   * Selects all items in the list.
   */
  selectAll(checked: boolean) {
    return checked ? this.listComponent.selectAll() : this.listComponent.deselectAll();
  }

  /**
   * Handles form submit.
   */
  save() {
    this.bottomSheetRef.dismiss(this.formGroup.get('list').value);
  }
}
