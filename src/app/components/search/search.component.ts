import { AsyncPipe, NgPlural, NgPluralCase } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  OnInit,
  output,
  viewChildren,
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
  firstValueFrom,
  lastValueFrom,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  switchMap,
  take,
  withLatestFrom,
} from 'rxjs';

import { SubSinkDirective } from '../../directives';
import { TranslatePipe } from '../../pipes';
import { KeyService, NavService, TabService } from '../../services';
import {
  Action,
  Actions,
  BrowserTab,
  BrowserTabs,
  listItemAnimation,
  RECENT_DISPLAY,
  RecentMap,
  removeRecent,
  Target,
} from '../../utils';
import { EmptyComponent } from '../empty/empty.component';
import { ListItemComponent } from '../list-item/list-item.component';
import { TabListComponent } from '../tab-list/tab-list.component';
import { TimelineLabelComponent } from '../timeline-label/timeline-label.component';

const fuseOptions: IFuseOptions<BrowserTab> = {
  ignoreLocation: true,
  keys: ['title', 'url'],
  minMatchCharLength: 1,
  threshold: 0.33,
  useExtendedSearch: true,
};

/**
 * @description
 *
 * Search form component
 */
@Component({
  selector: 'nc-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [listItemAnimation],
  imports: [
    AsyncPipe,
    EmptyComponent,
    ListItemComponent,
    MatCardModule,
    MatIconModule,
    NgPlural,
    NgPluralCase,
    TabListComponent,
    TimelineLabelComponent,
    TranslatePipe,
  ],
})
export class SearchComponent extends SubSinkDirective implements OnInit {
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
  readonly sourceTabs$ = new BehaviorSubject<BrowserTabs>(null);

  /**
   * Tabs from synced devices
   */
  deviceTabs$: Observable<BrowserTabs>;

  get target(): Target {
    return this.navService.isPopup ? '_blank' : '_self';
  }

  private listItems = viewChildren(ListItemComponent);

  readonly searchQuery$: Observable<string> = this.navService.paramsSearch$;
  readonly recentMap$: Observable<RecentMap> = this.tabService.recentTabs$;

  readonly defaultActions: Actions = [Action.Find, Action.Edit, Action.Delete];
  readonly recentActions: Actions = [Action.Forget, ...this.defaultActions];

  constructor(
    private readonly navService: NavService,
    private readonly tabService: TabService,
    private readonly keyService: KeyService<ListItemComponent>
  ) {
    super();

    effect(async () => {
      const listItems = this.listItems();
      this.keyService.clear();
      this.keyService.setItems(listItems);

      const searchQuery = await firstValueFrom(this.searchQuery$);

      if (searchQuery?.length > 0) {
        this.keyService.setActive(0);
      }
    });
  }

  ngOnInit() {
    const fuse = new Fuse<BrowserTab>([], fuseOptions);

    const fuse$: Observable<Fuse<BrowserTab>> = this.#source$.pipe(
      filter((source) => source?.length > 0),
      map((source) => {
        fuse.setCollection(source);
        return fuse;
      })
    );

    const searchResults$ = this.searchQuery$.pipe(
      filter((searchQuery) => searchQuery?.length > 0),
      distinctUntilChanged(),
      switchMap((searchValue) =>
        fuse$.pipe(
          take(1),
          map((fuse) => fuse.search(searchValue).map(({ item }) => item))
        )
      )
    );

    const sourceTabs = combineLatest([
      this.searchQuery$.pipe(startWith('')),
      searchResults$.pipe(startWith(null)),
      this.#source$,
    ])
      .pipe(
        filter(([, , tabs]) => tabs?.length > 0),
        distinctUntilChanged(
          ([query1, results1], [query2, results2]) => query1 === query2 && results1?.length === results2?.length
        ),
        withLatestFrom(this.recentMap$),
        map(([[searchQuery, searchResults, tabs], recentTabs]) => {
          if (searchQuery?.length) {
            return searchResults;
          }

          const sortTabs = this.tabService.sortByRecent(
            tabs.sort((a, b) => b.id - a.id),
            recentTabs
          );

          return sortTabs.slice(0, RECENT_DISPLAY);
        }),
        shareReplay(1)
      )
      .subscribe((tabs) => this.sourceTabs$.next(tabs));

    this.subscribe(sourceTabs);

    const fuseDevices$: Observable<Fuse<BrowserTab>> = this.#devices$.pipe(
      filter((devices) => devices?.length > 0),
      map((devices) => new Fuse(devices, fuseOptions)),
      take(1)
    );

    this.deviceTabs$ = this.searchQuery$.pipe(
      switchMap((search) => {
        if (search) {
          return fuseDevices$.pipe(map((fuse) => fuse.search(search)?.map(({ item }) => item)));
        }

        return of([]);
      }),
      shareReplay(1)
    );
  }

  /**
   * Handles tab update
   */
  async itemModified(tab: BrowserTab) {
    const updatedTab = await this.tabService.updateTab(tab);

    if (updatedTab) {
      const results = this.sourceTabs$.value;
      const index = this.getSearchIndex(tab, results);

      if (index > -1) {
        results.splice(index, 1, updatedTab);
        this.sourceTabs$.next(results);
      }
    }
  }

  /**
   * Handles tab deletion
   */
  async itemDeleted(tab: BrowserTab) {
    const messageRef = await this.tabService.removeTab(tab);
    const sourceTabs = this.sourceTabs$.value;
    const index = this.getSearchIndex(tab, sourceTabs);

    if (index > -1) {
      sourceTabs.splice(index, 1);
      this.sourceTabs$.next(sourceTabs);

      await removeRecent(tab?.id);

      const { dismissedByAction } = await lastValueFrom(messageRef.afterDismissed());

      if (dismissedByAction) {
        sourceTabs.splice(index, 0, tab);
        this.sourceTabs$.next(sourceTabs);
      }
    }
  }

  private getSearchIndex(tab: BrowserTab, source: BrowserTabs): number {
    return source.findIndex((t) => t === tab);
  }

  async recentRemoved(tab: BrowserTab) {
    if (tab) {
      await removeRecent(tab?.id);

      const sourceTabs = this.sourceTabs$.value;
      const index = this.getSearchIndex(tab, sourceTabs);

      if (index > -1) {
        sourceTabs.splice(index, 1);
        this.sourceTabs$.next(sourceTabs);

        return index;
      }
    }
  }
}
