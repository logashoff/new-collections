import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { BrowserTab } from 'src/app/utils';

/**
 * @description
 *
 * List item with tab information
 */
@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeAnimation', [
      state(
        'void',
        style({
          transform: 'translateY(20%)',
          opacity: 0,
        })
      ),
      transition('void => *', animate('250ms ease-out')),
    ]),
  ],
})
export class ListItemComponent {
  @HostBinding('@fadeAnimation')
  @Input()
  tab: BrowserTab;

  /**
   * Dispatches event when Delete menu item is clicked
   */
  @Output() readonly editClicked = new EventEmitter<BrowserTab>();

  /**
   * Dispatches event when Delete menu item is clicked
   */
  @Output() readonly deleteClicked = new EventEmitter<BrowserTab>();

  /**
   * Adds `tabId` attribute to component for `appScrollIntoView` directive to work
   */
  @HostBinding('attr.tabId') get tabId(): number {
    return this.tab.id;
  }

  /**
   * Opens dialog to edit specified tab.
   */
  async editClick() {
    this.editClicked.emit(this.tab);
  }

  /**
   * Handles delete menu item click
   */
  deleteClick() {
    this.deleteClicked.emit(this.tab);
  }
}
