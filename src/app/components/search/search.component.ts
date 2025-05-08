import { AsyncPipe, NgPlural, NgPluralCase } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import Fuse, { IFuseOptions } from 'fuse.js';
import { uniqBy } from 'lodash-es';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  map,
  Observable,
  shareReplay,
  startWith,
  withLatestFrom,
} from 'rxjs';

import { TranslatePipe } from '../../pipes';
import { KeyService, NavService, TabService } from '../../services';
import {
  Action,
  Actions,
  BrowserTab,
  BrowserTabs,
  listItemAnimation,
  MIN_RECENT_DISPLAY,
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
export class SearchComponent implements OnInit {
  readonly #destroyRef = inject(DestroyRef);
  readonly #keyService = inject<KeyService<ListItemComponent>>(KeyService);
  readonly #navService = inject(NavService);
  readonly #tabService = inject(TabService);

  readonly Action = Action;

  readonly source = input.required<BrowserTabs>();
  readonly #source$ = toObservable(this.source);
  readonly devices = input<BrowserTabs>();

  /**
   * Scroll list item into view
   */
  readonly findItem = output<BrowserTab>();

  /**
   * Tabs data from search results
   */
  readonly sourceTabs = signal<BrowserTabs>(null);

  /**
   * Tabs from synced devices
   */
  deviceTabs$: Observable<BrowserTabs>;

  get target(): Target {
    return this.#navService.isPopup ? '_blank' : '_self';
  }

  private listItems = viewChildren(ListItemComponent);

  readonly searchQuery$: Observable<string> = this.#navService.paramsSearch$;
  readonly recentMap$: Observable<RecentMap> = this.#tabService.recentTabs$;

  readonly defaultActions: Actions = [Action.Find, Action.Edit, Action.Delete];
  readonly recentActions: Actions = [Action.Forget, ...this.defaultActions];

  readonly #fuseDevices = new Fuse<BrowserTab>([], fuseOptions);
  readonly #fuseSource = new Fuse<BrowserTab>([], fuseOptions);

  constructor() {
    effect(async () => {
      const listItems = this.listItems();
      this.#keyService.clear();
      this.#keyService.setItems(listItems);

      const searchQuery = await firstValueFrom(this.searchQuery$);

      if (searchQuery?.length > 0) {
        this.#keyService.setActive(0);
      }

      this.#fuseDevices.setCollection(this.devices() ?? []);
      this.#fuseSource.setCollection(this.source());
    });
  }

  ngOnInit() {
    const searchResults$ = this.searchQuery$.pipe(
      filter((searchQuery) => searchQuery?.length > 0),
      distinctUntilChanged(),
      map((searchValue) => this.#fuseSource.search(searchValue).map(({ item }) => item))
    );

    combineLatest({
      searchQuery: this.searchQuery$.pipe(startWith('')),
      searchResults: searchResults$.pipe(startWith(null)),
      source: this.#source$,
    })
      .pipe(
        filter(({ source }) => source?.length > 0),
        distinctUntilChanged(
          ({ searchQuery: query1, searchResults: results1 }, { searchQuery: query2, searchResults: results2 }) =>
            query1 === query2 && results1?.length === results2?.length
        ),
        withLatestFrom(this.recentMap$),
        map(([{ searchQuery, searchResults, source }, recentTabs]) => {
          if (searchQuery?.length) {
            return searchResults?.slice();
          }

          const sortTabs = this.#tabService.sortByRecent(
            source.sort((a, b) => b.id - a.id),
            recentTabs
          );

          return sortTabs.slice(0, Math.max(recentTabs?.size ?? 0, MIN_RECENT_DISPLAY));
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe((tabs) => this.sourceTabs.set(tabs));

    this.deviceTabs$ = this.searchQuery$.pipe(
      map((search) => {
        if (search) {
          const searchResults = this.#fuseDevices.search(search)?.map(({ item }) => item);
          return uniqBy(searchResults, 'url');
        }

        return [];
      }),
      shareReplay(1)
    );
  }

  /**
   * Handles tab update
   */
  async itemModified(tab: BrowserTab) {
    const updatedTab = await this.#tabService.updateTab(tab);

    if (updatedTab) {
      const results = this.sourceTabs();
      const index = this.getSearchIndex(tab, results);

      if (index > -1) {
        results.splice(index, 1, updatedTab);
        this.sourceTabs.set(results);
      }
    }
  }

  /**
   * Handles tab deletion
   */
  async itemDeleted(tab: BrowserTab) {
    const sourceTabs = this.sourceTabs();
    const index = this.getSearchIndex(tab, sourceTabs);

    if (index > -1) {
      sourceTabs.splice(index, 1);
      this.sourceTabs.set(sourceTabs);

      await removeRecent(tab?.id);

      const messageRef = await this.#tabService.removeTab(tab);
      messageRef?.afterDismissed().subscribe(({ dismissedByAction }) => {
        if (dismissedByAction) {
          sourceTabs.splice(index, 0, tab);
          this.sourceTabs.set(sourceTabs);
        }
      });
    }
  }

  private getSearchIndex(tab: BrowserTab, source: BrowserTabs): number {
    return source.findIndex((t) => t === tab);
  }

  async recentRemoved(tab: BrowserTab) {
    if (tab) {
      await removeRecent(tab?.id);

      const sourceTabs = this.sourceTabs();
      const index = this.getSearchIndex(tab, sourceTabs);

      if (index > -1) {
        sourceTabs.splice(index, 1);
        this.sourceTabs.set(sourceTabs);

        return index;
      }
    }
  }
}
