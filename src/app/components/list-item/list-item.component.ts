import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  DataTestIdDirective,
  RecentDirective,
  ScrollIntoViewDirective,
  StopPropagationDirective,
} from '../../directives';
import { FaviconPipe, TranslatePipe } from '../../pipes';
import { Activatable } from '../../services';
import {
  Action,
  Actions,
  addRecent,
  BrowserTab,
  scrollIntoView,
  TabAction,
  tabActions,
  TabActions,
  Target,
} from '../../utils';
import { ChipComponent } from '../chip/chip.component';
import { RippleComponent } from '../ripple/ripple.component';
import { MatRipple } from '@angular/material/core';

/**
 * @description
 *
 * List item with tab information
 */
@Component({
  selector: 'nc-list-item',
  templateUrl: './list-item.component.html',
  styleUrl: './list-item.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.active]': 'isActive()',
    role: 'list-item',
    tabindex: '-1',
  },
  imports: [
    ChipComponent,
    DataTestIdDirective,
    FaviconPipe,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RecentDirective,
    RippleComponent,
    ScrollIntoViewDirective,
    StopPropagationDirective,
    TranslatePipe,
    MatRipple,
  ],
})
export class ListItemComponent implements Activatable {
  readonly #cdr = inject(ChangeDetectorRef);
  readonly #el = inject(ElementRef);

  readonly tab = input.required<BrowserTab>();
  readonly actions = input<Actions>();

  /**
   * Plays ripple animation when set to true
   */
  readonly focused = input<boolean>(false);

  /**
   * Dispatches event when Delete menu item is clicked
   */
  readonly modified = output<BrowserTab>();

  /**
   * Dispatches event when Delete menu item is clicked
   */
  readonly deleted = output<BrowserTab>();

  /**
   * Scroll this list item into view
   */
  readonly find = output<BrowserTab>();

  /**
   * Scroll this list item into view
   */
  readonly recent = output<BrowserTab>();

  /**
   * Target window to open URL
   */
  readonly target = input<Target>('_self');

  readonly isActive = signal<boolean>(false);

  get tabActions(): TabActions {
    return this.actions()?.map((action) => tabActions.get(action));
  }

  async activate() {
    const { id, url } = this.tab();
    await addRecent(id);
    open(url, this.target());
  }

  async handleAction(action: TabAction) {
    const tab = this.tab();

    switch (action.action) {
      case Action.Edit:
        this.modified.emit(tab);
        break;
      case Action.Find:
        this.find.emit(tab);
        break;
      case Action.Forget:
        this.recent.emit(tab);
        break;
      case Action.Delete:
        this.deleted.emit(tab);
        break;
    }
  }

  async setActiveStyles() {
    this.isActive.set(true);

    this.#cdr.markForCheck();

    await scrollIntoView(this.#el.nativeElement, { block: 'center' });
  }

  setInactiveStyles() {
    this.isActive.set(false);

    this.#cdr.markForCheck();
  }
}
