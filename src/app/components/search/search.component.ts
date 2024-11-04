import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  input,
  OnDestroy,
  OnInit,
  output,
  QueryList,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import Fuse, { IFuseOptions } from 'fuse.js';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  lastValueFrom,
  map,
  Observable,
  of,
  shareReplay,
  Subscription,
  switchMap,
  take,
} from 'rxjs';

import { TranslatePipe } from '../../pipes';
import { KeyService, NavService, TabService } from '../../services';
import { Action, BrowserTab, BrowserTabs, listItemAnimation } from '../../utils';
import { EmptyComponent } from '../empty/empty.component';
import { ListItemComponent } from '../list-item/list-item.component';
import { SearchFormComponent } from '../search-form/search-form.component';
import { TabListComponent } from '../tab-list/tab-list.component';
import { TimelineLabelComponent } from '../timeline-label/timeline-label.component';

const fuseOptions: IFuseOptions<BrowserTab> = {
  keys: ['title', 'url'],
  threshold: 0.33,
  ignoreLocation: true,
  useExtendedSearch: true,
};

/**
 * @description
 *
 * Search form component
 */
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  animations: [listItemAnimation],
  imports: [
    CommonModule,
    EmptyComponent,
    ListItemComponent,
    MatCardModule,
    MatIconModule,
    SearchFormComponent,
    TabListComponent,
    TimelineLabelComponent,
    TranslatePipe,
  ],
})
export class SearchComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly Action = Action;

  readonly source = input.required<BrowserTabs>();
  readonly #source$ = toObservable(this.source);

  readonly devices = input<BrowserTabs>();
  readonly #devices$ = toObservable(this.devices);

  /**
   * Scroll list item into view
   */
  readonly findItem = output<BrowserTab>();

  /**
   * Tabs data from search results
   */
  sourceTabs$: Observable<BrowserTabs>;

  /**
   * Tabs from synced devices
   */
  deviceTabs$: Observable<BrowserTabs>;

  readonly #searchResults$ = new BehaviorSubject<BrowserTabs>([]);

  #resultChanges: Subscription;

  readonly openTabs$ = this.tabService.openTabChanges$.pipe(shareReplay(1));
  readonly timelineTabs$ = this.tabService.tabs$.pipe(shareReplay(1));
  readonly isPopup = this.navService.isPopup;

  @ViewChildren(ListItemComponent)
  private listItems: QueryList<ListItemComponent>;

  #itemChanges: Subscription;

  constructor(
    private readonly navService: NavService,
    private readonly tabService: TabService,
    private readonly keyService: KeyService<ListItemComponent>
  ) {}

  ngOnInit() {
    const searchValue$ = this.navService.paramsSearch$.pipe(shareReplay(1));

    const fuse = new Fuse<BrowserTab>([], fuseOptions);

    const fuse$: Observable<Fuse<BrowserTab>> = this.#source$.pipe(
      filter((source) => source?.length > 0),
      map((source) => {
        fuse.setCollection(source);
        return fuse;
      })
    );

    this.#resultChanges = searchValue$
      .pipe(
        filter((searchValue) => searchValue?.length > 0),
        distinctUntilChanged(),
        switchMap((searchValue) =>
          fuse$.pipe(
            take(1),
            map((fuse) => fuse.search(searchValue).map(({ item }) => item))
          )
        )
      )
      .subscribe((results) => this.#searchResults$.next(results));

    this.sourceTabs$ = combineLatest([searchValue$, this.#searchResults$, this.#source$]).pipe(
      map(([searchValue, searchResults, source]) => {
        if (searchValue?.length) {
          return searchResults;
        }

        return source;
      }),
      shareReplay(1)
    );

    const fuseDevices$: Observable<Fuse<BrowserTab>> = this.#devices$.pipe(
      filter((devices) => devices?.length > 0),
      map((devices) => new Fuse(devices, fuseOptions)),
      take(1)
    );

    this.deviceTabs$ = searchValue$.pipe(
      switchMap((search) => {
        if (search) {
          return fuseDevices$.pipe(map((fuse) => fuse.search(search)?.map(({ item }) => item)));
        }

        return of([]);
      }),
      shareReplay(1)
    );
  }

  ngAfterViewInit() {
    this.#itemChanges = this.listItems.changes.subscribe(() => this.keyService.setItems(this.listItems));
  }

  ngOnDestroy() {
    this.#resultChanges.unsubscribe();
    this.#itemChanges.unsubscribe();
  }

  /**
   * Handles tab update
   */
  async itemModified(tab: BrowserTab) {
    const updatedTab = await this.tabService.updateTab(tab);

    if (updatedTab) {
      const index = this.getSearchIndex(tab);

      if (index > -1) {
        const results = this.#searchResults$.value;
        results.splice(index, 1, updatedTab);
        this.#searchResults$.next(results);
      }
    }
  }

  /**
   * Handles tab deletion
   */
  async itemDeleted(tab: BrowserTab) {
    const messageRef = await this.tabService.removeTab(tab);

    const index = this.getSearchIndex(tab);

    if (index > -1) {
      const results = this.#searchResults$.value;
      results.splice(index, 1);
      this.#searchResults$.next(results);

      const { dismissedByAction } = await lastValueFrom(messageRef.afterDismissed());

      if (dismissedByAction) {
        results.splice(index, 0, tab);
        this.#searchResults$.next(results);
      }
    }
  }

  private getSearchIndex(tab: BrowserTab): number {
    return this.#searchResults$.value?.findIndex((t) => t === tab);
  }
}
