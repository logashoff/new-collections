import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { RecentDirective, StopPropagationDirective } from '../../directives';
import { FaviconPipe, TranslatePipe } from '../../pipes';
import { Activatable } from '../../services';
import { Action, addRecent, BrowserTab, removeRecent, scrollIntoView, TabAction, TabActions } from '../../utils';
import { ChipComponent } from '../chip/chip.component';
import { LabelComponent } from '../label/label.component';
import { RippleComponent } from '../ripple/ripple.component';

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
  standalone: true,
  host: {
    tabindex: '-1',
    role: 'list-item',
  },
  imports: [
    ChipComponent,
    CommonModule,
    FaviconPipe,
    LabelComponent,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RecentDirective,
    RippleComponent,
    StopPropagationDirective,
    TranslatePipe,
  ],
})
export class ListItemComponent implements Activatable {
  readonly tab = input.required<BrowserTab>();
  readonly actions = input<TabActions>();
  readonly isRecent = input<boolean>(false);

  readonly hasActive = input<boolean>(false);
  readonly hasDuplicate = input<boolean>(false);
  readonly hasPinned = input<boolean>(false);
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
   * Target window to open URL
   */
  readonly target = input<'_blank' | '_self'>('_self');

  private _isActive = false;

  @HostBinding('class.active')
  private get isActive() {
    return this._isActive;
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private el: ElementRef
  ) {}

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
        await removeRecent(tab.id);
        break;
      case Action.Delete:
        this.deleted.emit(tab);
        break;
    }
  }

  async setActiveStyles() {
    this._isActive = true;

    await scrollIntoView(this.el.nativeElement, { block: 'center' });

    this.cdr.markForCheck();
  }

  setInactiveStyles() {
    this._isActive = false;
    this.cdr.markForCheck();
  }
}
