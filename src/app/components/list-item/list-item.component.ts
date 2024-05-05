import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { EXPANSION_PANEL_ANIMATION_TIMING } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Observable, combineLatest, map, shareReplay, switchMap } from 'rxjs';
import { StopPropagationDirective } from '../../directives/index';
import { FaviconPipe } from '../../pipes/index';
import { NavService, TabService } from '../../services/index';
import { BrowserTab, BrowserTabs, TabDelete, Tabs } from '../../utils/index';
import { ChipComponent } from '../chip/chip.component';
import { LabelComponent } from '../label/label.component';
import { RippleComponent } from '../ripple/ripple.component';

/**
 * @description
 *
 * List item with tab information
 */
@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrl: './list-item.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ChipComponent,
    CommonModule,
    FaviconPipe,
    LabelComponent,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RippleComponent,
    StopPropagationDirective,
    TranslateModule,
  ],
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

  get savedTabs$(): Observable<BrowserTabs> {
    return this.tabService?.tabs$.pipe(shareReplay(1));
  }

  /**
   * Plays ripple animation when set to true
   */
  @Input() focused = false;

  /**
   * Disables item menu
   */
  readonly notReadOnly$: Observable<boolean> = this.tab$.pipe(
    switchMap((tab) => this.savedTabs$.pipe(map((tabs) => tabs.some((t) => t.id === tab.id)))),
    shareReplay(1)
  );

  /**
   * Indicates if list item is part of timeline.
   */
  readonly inTimeline$: Observable<boolean> = this.tab$.pipe(
    switchMap((tab) => this.savedTabs$.pipe(map((tabs) => tabs.some((t) => t.id === tab.id)))),
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
   * Scroll this list item into view
   */
  @Output() readonly find = new EventEmitter<BrowserTab>();

  /**
   * Target where URL will be opened when list item is clicked
   */
  get target(): string {
    return this.nav.isPopup ? '_blank' : '_self';
  }

  /**
   * Indicates how many tabs are currently open that match this tab's URL
   */
  readonly openTabs$: Observable<number>;

  readonly dupTabs$: Observable<number> = this.tab$.pipe(
    switchMap((tab) => this.savedTabs$.pipe(map((tabs) => tabs.filter((t) => t.url === tab.url)?.length)))
  );

  readonly activeTab$: Observable<boolean>;
  readonly pinnedTab$: Observable<boolean>;
  readonly hasLabels$: Observable<boolean>;

  constructor(
    private tabService: TabService,
    private nav: NavService
  ) {
    const openTabs$: Observable<Tabs> = combineLatest([this.tab$, this.tabService.tabChanges$]).pipe(
      map(([tab, tabs]) => tabs?.filter((t) => t.url === tab.url)),
      shareReplay(1)
    );

    this.activeTab$ = openTabs$.pipe(
      map((tabs) => tabs?.some((t) => t.active)),
      shareReplay(1)
    );

    this.pinnedTab$ = openTabs$.pipe(
      map((tabs) => tabs?.some((t) => t.pinned)),
      shareReplay(1)
    );

    this.openTabs$ = openTabs$.pipe(
      map((tabs) => tabs?.length),
      shareReplay(1)
    );

    this.hasLabels$ = combineLatest([this.activeTab$, this.pinnedTab$, this.openTabs$, this.dupTabs$]).pipe(
      map(([active, pinned, openTabs, dupTabs]) => active || pinned || openTabs > 0 || dupTabs > 1),
      shareReplay(1)
    );
  }

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
}
