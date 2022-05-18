import { ChangeDetectionStrategy, Component, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatSelectionList } from '@angular/material/list';
import { isNil } from 'lodash';
import { filter, map, Observable, shareReplay, withLatestFrom } from 'rxjs';
import { Tab } from 'src/app/utils';

/**
 * @description
 *
 * Bottom sheet for selecting specified tabs.
 */
@Component({
  selector: 'app-tabs-selector',
  templateUrl: './tabs-selector.component.html',
  styleUrls: ['./tabs-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TabsSelectorComponent {
  /**
   * Root group form.
   */
  readonly formGroup = new FormGroup({
    list: new FormControl([], [Validators.required, Validators.minLength(1)]),
  });

  /**
   * List of checked items.
   */
  private readonly checkList$: Observable<Tab[]> = this.formGroup.valueChanges.pipe(
    filter((values) => !isNil(values)),
    map(({ list }) => list),
    shareReplay(1)
  );

  /**
   * True if all list items are selected.
   */
  readonly allSelected$: Observable<boolean> = this.checkList$.pipe(
    map((list) => list.length === this.tabs.length),
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
    @Inject(MAT_BOTTOM_SHEET_DATA) readonly tabs: Tab[],
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
