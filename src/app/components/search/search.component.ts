import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import Fuse, { IFuseOptions } from 'fuse.js';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  filter,
  firstValueFrom,
  lastValueFrom,
  map,
  of,
  shareReplay,
  switchMap,
  take,
} from 'rxjs';
import { NavService } from '../../services/index';
import { Action, BrowserTab, BrowserTabs, TabDelete } from '../../utils/index';
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
  standalone: true,
  imports: [
    CommonModule,
    EmptyComponent,
    ListItemComponent,
    MatCardModule,
    MatIconModule,
    SearchFormComponent,
    TabListComponent,
    TimelineLabelComponent,
    TranslateModule,
  ],
})
export class SearchComponent implements OnInit {
  readonly Action = Action;

  readonly #devices$ = new BehaviorSubject<BrowserTabs>([]);
  readonly #source$ = new BehaviorSubject<BrowserTabs>([]);

  @Input() set source(value: BrowserTabs) {
    if (value?.length) {
      this.#source$.next([...value]);
    }
  }

  get source(): BrowserTabs {
    return this.#source$.value;
  }

  @Input() set devices(value: BrowserTabs) {
    this.#devices$.next(value);
  }

  get devices(): BrowserTabs {
    return this.#devices$.value;
  }

  /**
   * Scroll list item into view
   */
  @Output() readonly findItem = new EventEmitter<BrowserTab>();

  /**
   * Tabs data from search results
   */
  sourceTabs$: Observable<BrowserTabs>;

  /**
   * Tabs from synced devices
   */
  deviceTabs$: Observable<BrowserTabs>;

  constructor(private navService: NavService) {}

  ngOnInit() {
    const searchValue$ = this.navService.paramsSearch$.pipe(shareReplay(1));

    const source$ = this.#source$.pipe(
      filter((source) => source?.length > 0),
      take(1),
      shareReplay(1)
    );

    const fuseSource$ = source$.pipe(
      map((source) => new Fuse(source, fuseOptions)),
      shareReplay(1)
    );

    this.sourceTabs$ = combineLatest([searchValue$, source$]).pipe(
      switchMap(([search, source]) => {
        if (search) {
          return fuseSource$.pipe(map((fuse) => fuse.search(search)?.map(({ item }) => item)));
        }

        return of(source);
      }),
      shareReplay(1)
    );

    const fuseDevices$: Observable<Fuse<BrowserTab>> = this.#devices$.pipe(
      filter(devices => devices?.length > 0),
      map((devices) => new Fuse(devices, fuseOptions)),
      shareReplay(1)
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

  /**
   * Handles tab update
   */
  async itemModified(updatedTab: BrowserTab) {
    const tabs = await firstValueFrom(this.sourceTabs$);

    if (updatedTab && !tabs.includes(updatedTab)) {
      const index = tabs.findIndex((t) => t.id === updatedTab.id);

      if (index > -1) {
        tabs.splice(index, 1, updatedTab);
      }
    }
  }

  /**
   * Handles tab deletion
   */
  async itemDeleted({ deletedTab, revertDelete }: TabDelete) {
    const tabs = await firstValueFrom(this.sourceTabs$);

    let index = tabs.findIndex((tab) => tab === deletedTab);
    if (revertDelete && index > -1) {
      tabs.splice(index, 1);

      const { dismissedByAction: undo } = await lastValueFrom(revertDelete.afterDismissed());

      if (undo) {
        tabs.splice(index, 0, deletedTab);
      }
    }
  }
}
