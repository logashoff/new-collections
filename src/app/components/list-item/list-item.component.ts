import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Observable, combineLatest, filter, map, shareReplay, switchMap } from 'rxjs';
import { StopPropagationDirective } from '../../directives/index';
import { FaviconPipe } from '../../pipes/index';
import { BrowserTab, BrowserTabs, Tabs } from '../../utils/index';
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
})
export class ListItemComponent implements OnInit {
  readonly #tab$ = new BehaviorSubject<BrowserTab>(null);

  @Input()
  set tab(value: BrowserTab) {
    this.#tab$.next(value);
  }

  get tab(): BrowserTab {
    return this.#tab$.value;
  }

  readonly #tabs$ = new BehaviorSubject<BrowserTabs>(null);

  @Input() set tabs(value: BrowserTabs) {
    this.#tabs$.next(value);
  }

  readonly #openTabs$ = new BehaviorSubject<Tabs>(null);

  @Input() set openTabs(value: Tabs) {
    this.#openTabs$.next(value);
  }

  /**
   * Plays ripple animation when set to true
   */
  @Input() focused = false;

  /**
   * Disables item menu
   */
  readonly notReadOnly$: Observable<boolean> = this.#tab$.pipe(
    switchMap((tab) =>
      this.#tabs$.pipe(
        filter((tabs) => tabs?.length > 0),
        map((tabs) => tabs.some((t) => t.id === tab.id))
      )
    ),
    shareReplay(1)
  );

  /**
   * Indicates if list item is part of timeline.
   */
  readonly inTimeline$: Observable<boolean> = this.#tab$.pipe(
    switchMap((tab) =>
      this.#tabs$.pipe(
        filter((tabs) => tabs?.length > 0),
        map((tabs) => tabs.some((t) => t.id === tab.id))
      )
    ),
    shareReplay(1)
  );

  /**
   * Dispatches event when Delete menu item is clicked
   */
  @Output() readonly modified = new EventEmitter<BrowserTab>();

  /**
   * Dispatches event when Delete menu item is clicked
   */
  @Output() readonly deleted = new EventEmitter<BrowserTab>();

  /**
   * Scroll this list item into view
   */
  @Output() readonly find = new EventEmitter<BrowserTab>();

  /**
   * Target window to open URL
   */
  @Input() target: '_blank' | '_self' = '_self';

  /**
   * Indicates how many tabs are currently open that match this tab's URL
   */
  openTabsCount$: Observable<number>;

  readonly dupTabs$: Observable<number> = this.#tab$.pipe(
    switchMap((tab) =>
      this.#tabs$.pipe(
        filter((tabs) => tabs?.length > 0),
        map((tabs) => tabs.filter((t) => t.url === tab.url)?.length)
      )
    ),
    shareReplay(1)
  );

  activeTab$: Observable<boolean>;
  pinnedTab$: Observable<boolean>;
  hasLabels$: Observable<boolean>;

  ngOnInit() {
    const openTabs$: Observable<Tabs> = combineLatest([this.#tab$, this.#openTabs$]).pipe(
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

    this.openTabsCount$ = openTabs$.pipe(
      map((tabs) => tabs?.length),
      shareReplay(1)
    );

    this.hasLabels$ = combineLatest([this.activeTab$, this.pinnedTab$, this.openTabsCount$, this.dupTabs$]).pipe(
      map(([active, pinned, openTabs, dupTabs]) => active || pinned || openTabs > 0 || dupTabs > 1),
      shareReplay(1)
    );
  }

  /**
   * Opens dialog to edit specified tab.
   */
  async editClick() {
    this.modified.emit(this.tab);
  }

  /**
   * Handles delete menu item click
   */
  async deleteClick() {
    this.deleted.emit(this.tab);
  }
}
