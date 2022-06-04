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
import { EXPANSION_PANEL_ANIMATION_TIMING } from '@angular/material/expansion';
import { BehaviorSubject, map, Observable, shareReplay, switchMap } from 'rxjs';
import { NavService, TabService } from 'src/app/services';
import { BrowserTab, TabDelete } from 'src/app/utils';

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
      transition('void => *', animate(EXPANSION_PANEL_ANIMATION_TIMING)),
    ]),
  ],
})
export class ListItemComponent {
  private readonly tab$ = new BehaviorSubject<BrowserTab>(null);

  @HostBinding('@fadeAnimation')
  @Input()
  set tab(value: BrowserTab) {
    this.tab$.next(value);
  }

  get tab(): BrowserTab {
    return this.tab$.value;
  }

  /**
   * Disables item menu
   */
  readonly readOnly$: Observable<boolean> = this.tab$.pipe(
    switchMap((tab) => this.tabService.tabs$.pipe(map((tabs) => !tabs.includes(tab)))),
    shareReplay(1)
  );

  /**
   * Displays locate button to navigate to item in the list.
   */
  @Input() showItemLocation = false;

  readonly canLocate$: Observable<boolean> = this.tab$.pipe(
    switchMap((tab) => this.tabService.tabs$.pipe(map((tabs) => tabs.includes(tab)))),
    shareReplay(1)
  );

  /**
   * Dispatches event when Delete menu item is clicked
   */
  @Output() readonly modified = new EventEmitter<BrowserTab>();

  /**
   * Dispatches event when Delete menu item is clicked
   */
  @Output() readonly deleted = new EventEmitter<TabDelete>();

  /**
   * Adds `tabId` attribute to component for `appScrollIntoView` directive to work
   */
  @HostBinding('attr.data-tab-id') get tabId(): number {
    return this.tab.id;
  }

  /**
   * Target where URL will be opened when list item is clicked
   */
  get target(): string {
    return this.nav.isPopup ? '_blank' : '_self';
  }

  constructor(private tabService: TabService, private nav: NavService) {}

  /**
   * Opens dialog to edit specified tab.
   */
  async editClick() {
    const updatedTab = await this.tabService.updateTab(this.tab);

    this.modified.emit(updatedTab);
  }

  /**
   * Handles delete menu item click
   */
  async deleteClick() {
    const messageRef = await this.tabService.removeTab(this.tab);

    this.deleted.emit({
      deletedTab: this.tab,
      revertDelete: messageRef,
    });
  }

  /**
   * Navigates to tab location.
   */
  async locateItem() {
    const group = await this.tabService.getGroupByTab(this.tab);

    if (group) {
      this.nav.setParams(group.id, this.tab.id);
    }
  }
}
