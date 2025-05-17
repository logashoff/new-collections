import { AsyncPipe, NgClass } from '@angular/common';
import { AfterViewInit, Component, inject, viewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter, map, Observable, shareReplay, startWith, withLatestFrom } from 'rxjs';

import { FaviconPipe } from '../../pipes/favicon.pipe';
import { HostnamePipe } from '../../pipes/hostname.pipe';
import { TranslatePipe } from '../../pipes/translate.pipe';
import type { Tabs } from '../../utils/models';
import { ChipComponent } from '../chip/chip.component';

/**
 * Form for selecting new tabs to add to existing or new group.
 */
interface TabSelectorForm {
  list: FormControl<Tabs>;
}

/**
 * @description
 *
 * Dialog for selecting specified tabs.
 */
@Component({
  selector: 'nc-tabs-selector',
  templateUrl: './tabs-selector.component.html',
  styleUrl: './tabs-selector.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    AsyncPipe,
    ChipComponent,
    FaviconPipe,
    HostnamePipe,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatTooltipModule,
    NgClass,
    ReactiveFormsModule,
    TranslatePipe,
  ],
})
export class TabsSelectorComponent implements AfterViewInit {
  readonly #dialogRef = inject<MatDialogRef<TabsSelectorComponent, Tabs>>(MatDialogRef);
  readonly tabs = inject<Tabs>(MAT_DIALOG_DATA);

  /**
   * Root group form.
   */
  readonly formGroup = new FormGroup<TabSelectorForm>({
    list: new FormControl<Tabs>([], [Validators.required, Validators.minLength(1)]),
  });

  /**
   * List of checked items.
   */
  private readonly checkList$: Observable<Tabs> = this.formGroup.valueChanges.pipe(
    filter((values) => Boolean(values)),
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
  private listComponent = viewChild(MatSelectionList);

  private get list(): FormControl<Tabs> {
    return this.formGroup.get('list') as FormControl;
  }

  readonly tabGroupById = new Map<number, chrome.tabGroups.TabGroup>();

  constructor() {
    this.tabs?.forEach(async (tab) => {
      if (tab?.groupId > -1) {
        const tabGroup = await chrome.tabGroups.get(tab.groupId);

        if (tabGroup) {
          this.tabGroupById.set(tabGroup.id, tabGroup);
        }
      }
    });
  }

  ngAfterViewInit() {
    const activeTab = this.tabs.filter((tab) => tab.active);

    if (activeTab?.length > 0) {
      this.list.setValue(activeTab);
    }
  }

  /**
   * Selects all items in the list.
   */
  selectAll(checked: boolean) {
    const listComponent = this.listComponent();
    return checked ? listComponent.selectAll() : listComponent.deselectAll();
  }

  /**
   * Handles form submit.
   */
  save() {
    this.#dialogRef.close(this.list.value);
  }
}
