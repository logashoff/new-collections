import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import Fuse, { IFuseOptions } from 'fuse.js';
import { isNil } from 'lodash';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  firstValueFrom,
  lastValueFrom,
  map,
  shareReplay,
  withLatestFrom,
} from 'rxjs';
import { NavService } from 'src/app/services';
import { Action, BrowserTab, BrowserTabs, TabDelete } from 'src/app/utils';
import { StickyDirective } from '../../directives';
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
    StickyDirective,
    TabListComponent,
    TimelineLabelComponent,
    TranslateModule,
  ],
})
export class SearchComponent implements OnInit {
  Action = Action;

  private readonly source$ = new BehaviorSubject<BrowserTabs>([]);

  @Input() set source(value: BrowserTabs) {
    this.source$.next(value);
  }

  get source(): BrowserTabs {
    return this.source$.value;
  }

  private readonly devices$ = new BehaviorSubject<BrowserTabs>([]);

  @Input() set devices(value: BrowserTabs) {
    this.devices$.next(value);
  }

  get devices(): BrowserTabs {
    return this.devices$.value;
  }

  /**
   * Returns Fuse search instance.
   */
  private readonly fuseSource$: Observable<Fuse<BrowserTab>> = this.source$.pipe(
    map((source) => new Fuse(source ?? [], fuseOptions)),
    shareReplay(1)
  );

  private readonly fuseDevices$: Observable<Fuse<BrowserTab>> = this.devices$.pipe(
    map((devices) => new Fuse(devices ?? [], fuseOptions)),
    shareReplay(1)
  );

  /**
   * Tabs data from search results
   */
  sourceTabs$: Observable<BrowserTab[]>;

  deviceTabs$: Observable<BrowserTab[]>;

  /**
   * Indicates search results state
   */
  hasSearchValue$: Observable<boolean>;

  searchValue$: Observable<string>;

  constructor(private navService: NavService) {}

  ngOnInit() {
    this.searchValue$ = this.navService.paramsSearch$.pipe(shareReplay(1));

    this.sourceTabs$ = this.searchValue$.pipe(
      withLatestFrom(this.fuseSource$),
      map(([search, fuse]) => (search?.length > 0 ? fuse.search(search) : null)),
      map((searchResults) => searchResults?.map(({ item }) => item)),
      shareReplay(1)
    );

    this.deviceTabs$ = this.searchValue$.pipe(
      withLatestFrom(this.fuseDevices$),
      map(([search, fuse]) => (search?.length > 0 ? fuse.search(search) : null)),
      map((searchResults) => searchResults?.map(({ item }) => item)),
      shareReplay(1)
    );

    this.hasSearchValue$ = combineLatest([this.sourceTabs$, this.deviceTabs$]).pipe(
      map(([sourceTabs, deviceTabs]) => !isNil(sourceTabs) || !isNil(deviceTabs)),
      shareReplay(1)
    );

    this.navService.reset();
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

  searchChange(value: string) {
    if (value) {
      this.navService.search(value);
    } else {
      this.navService.reset();
    }

    document.body.scrollTo(0, 0);
  }
}
