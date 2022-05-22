import { Injectable } from '@angular/core';
import Fuse from 'fuse.js';
import { flatMap } from 'lodash';
import { BehaviorSubject, map, Observable, shareReplay } from 'rxjs';
import { BrowserTab, BrowserTabs } from '../utils';
import { TabService } from './tab.service';

/**
 * Fuse.js options.
 */
const fuseOptions: Fuse.IFuseOptions<BrowserTab> = {
  keys: ['title', 'url'],
  threshold: 0.5,
};

/**
 * @description
 *
 * Search service used be search component.
 */
@Injectable({
  providedIn: 'root',
})
export class SearchService {
  /**
   * Search value source will trigger data refresh.
   */
  private readonly searchValue$ = new BehaviorSubject<string>('');

  /**
   * Tab list source from all tab groups.
   */
  private readonly tabs$: Observable<BrowserTabs> = this.tabService.tabGroups$.pipe(
    map((tabGroups) => flatMap(tabGroups, (tabGroup) => tabGroup.tabs)),
    shareReplay(1)
  );

  /**
   * Returns Fuse search instance.
   */
  readonly fuse$: Observable<Fuse<BrowserTab>> = this.tabs$.pipe(
    map((tabs) => new Fuse(tabs, fuseOptions)),
    shareReplay(1)
  );

  constructor(private tabService: TabService) {}
}
