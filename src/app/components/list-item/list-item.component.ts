import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, OnInit, output, ViewEncapsulation } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { combineLatest, filter, map, Observable, shareReplay, switchMap, tap, withLatestFrom } from 'rxjs';
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
  readonly openTabs = input<Tabs>();
  readonly #openTabs$: Observable<Tabs>;

  readonly tab = input<BrowserTab>();
  readonly #tab$: Observable<BrowserTab>;

  readonly tabs = input<BrowserTabs>();
  readonly #tabs$: Observable<BrowserTabs>;

  /**
   * Plays ripple animation when set to true
   */
  readonly focused = input<boolean>(false);

  /**
   * Disables item menu
   */
  readonly notReadOnly$: Observable<boolean>;

  /**
   * Indicates if list item is part of timeline.
   */
  readonly inTimeline$: Observable<boolean>;

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

  /**
   * Display button to trigger `find` event emitter
   */
  readonly useFind = input<boolean>(false);

  /**
   * Indicates how many tabs are currently open that match this tab's URL
   */
  openTabsCount$: Observable<number>;

  readonly dupTabs$: Observable<number>;

  activeTab$: Observable<boolean>;
  pinnedTab$: Observable<boolean>;
  hasLabels$: Observable<boolean>;

  constructor() {
    this.#openTabs$ = toObservable(this.openTabs);
    this.#tab$ = toObservable(this.tab);
    this.#tabs$ = toObservable(this.tabs);

    this.notReadOnly$ = this.#tab$.pipe(
      switchMap((tab) =>
        this.#tabs$.pipe(
          filter((tabs) => tabs?.length > 0),
          map((tabs) => tabs.some((t) => t.id === tab.id))
        )
      ),
      shareReplay(1)
    );

    this.dupTabs$ = this.#tab$.pipe(
      switchMap((tab) =>
        this.#tabs$.pipe(
          filter((tabs) => tabs?.length > 0),
          map((tabs) => tabs.filter((t) => t.url === tab.url)?.length)
        )
      ),
      shareReplay(1)
    );

    this.inTimeline$ = toObservable(this.useFind).pipe(
      filter((useFind) => useFind),
      withLatestFrom(this.#tab$),
      switchMap(([_, tab]) =>
        this.#tabs$.pipe(
          filter((tabs) => tabs?.length > 0),
          map((tabs) => tabs.some((t) => t.id === tab.id))
        )
      ),
      shareReplay(1)
    );
  }

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
    this.modified.emit(this.tab());
  }

  /**
   * Handles delete menu item click
   */
  async deleteClick() {
    this.deleted.emit(this.tab());
  }
}
