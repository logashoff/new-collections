import { AsyncPipe, NgClass } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { FormField, form, minLength, required } from '@angular/forms/signals';
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
 * Map tab ID to aux group classes
 */
type GroupClasses = Map<number, string[]>;

/**
 * Form for selecting new tabs to add to existing or new group.
 */
interface TabSelectorModel {
  list: Tabs;
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    FormField,
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

  readonly #tabs = inject<Tabs>(MAT_DIALOG_DATA);
  readonly tabs = signal<Tabs>(this.#tabs);

  readonly tabSelectorModel = signal<TabSelectorModel>({
    list: [],
  });

  /**
   * Root group form.
   */
  readonly tabSelectorForm = form(this.tabSelectorModel, (schemaPath) => {
    required(schemaPath.list);
    minLength(schemaPath.list, 1);
  });

  /**
   * List of checked items.
   */
  private readonly checkList$: Observable<Tabs> = toObservable(this.tabSelectorModel).pipe(
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
    map((len) => len === this.tabs().length),
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

  readonly groupClasses = signal<GroupClasses>(null);

  constructor() {
    effect(async () => {
      const tabs = this.tabs().filter((tab) => tab.groupId > -1);

      if (tabs?.length > 0) {
        const groupClasses: GroupClasses = new Map();

        for (const [i, tab] of tabs.entries()) {
          const tabGroup = await chrome.tabGroups.get(tab.groupId);

          if (tabGroup) {
            const isFirstInGroup = !i || tabs[i - 1]?.groupId !== tabGroup.id;
            const isLastInGroup = i === tabs.length - 1 || tabs[i + 1]?.groupId !== tabGroup.id;
            const prefixClass: string = isFirstInGroup ? 'prefix-group' : '';
            const suffixClass: string = isLastInGroup ? 'suffix-group' : '';

            groupClasses.set(tab.id, ['tab-group', `group-color-${tabGroup.color}`, prefixClass, suffixClass]);
          }
        }

        this.groupClasses.set(groupClasses);
      }
    });
  }

  ngAfterViewInit() {
    const activeTab = this.tabs().filter((tab) => tab.active);

    if (activeTab?.length > 0) {
      this.tabSelectorForm.list().value.set(activeTab);
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
  save(event: Event) {
    event.preventDefault();

    this.#dialogRef.close(this.tabSelectorModel().list);
  }
}
