import { Injectable } from '@angular/core';
import { ActivatedRoute, EventType, Router, RouterEvent } from '@angular/router';
import { Observable, distinctUntilChanged, filter, map, shareReplay, startWith } from 'rxjs';
import { RouterExtras } from '../utils/index';

@Injectable({
  providedIn: 'root',
})
export class NavService {
  /**
   * Group ID set by URL query params
   */
  readonly paramsGroupId$: Observable<string>;

  /**
   * Group ID set by URL query params
   */
  readonly paramsTabId$: Observable<number>;

  /**
   * Group ID set by URL query params
   */
  readonly paramsSearch$: Observable<string>;

  /**
   * URL changes
   */
  readonly url$: Observable<string>;

  /**
   * Checks is current nav state is popup.
   * TODO: Does chrome API has extension type indicator?
   */
  get isPopup(): boolean {
    return this.isActive('popup');
  }

  constructor(
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {
    const url$ = this.router.events.pipe(
      filter((events) => events?.type === EventType.NavigationEnd),
      map((events) => {
        const e: RouterEvent = events as RouterEvent;
        return e.url;
      })
    );

    this.url$ = url$.pipe(startWith(this.router.url), distinctUntilChanged(), shareReplay(1));

    this.paramsGroupId$ = this.activeRoute.queryParams.pipe(
      distinctUntilChanged((prev, curr) => prev.groupId === curr.groupId),
      map((params) => params.groupId),
      shareReplay(1)
    );

    this.paramsTabId$ = this.activeRoute.queryParams.pipe(
      distinctUntilChanged((prev, curr) => prev.tabId === curr.tabId),
      map((params) => +params.tabId),
      shareReplay(1)
    );

    this.paramsSearch$ = this.activeRoute.queryParams.pipe(
      distinctUntilChanged((prev, curr) => prev.query === curr.query),
      map((params) => params.query as string),
      shareReplay(1)
    );
  }

  /**
   * Check if URL contains path
   */
  isActive(path: string | RegExp) {
    return this.router.url.match(new RegExp(path, 'gi'))?.length > 0;
  }

  reset() {
    return this.navigate([], {
      relativeTo: this.activeRoute,
      queryParams: {
        groupId: undefined,
        tabId: undefined,
        query: undefined,
      },
      queryParamsHandling: 'merge',
    });
  }

  search(value: string) {
    return this.navigate([], {
      relativeTo: this.activeRoute,
      queryParams: {
        groupId: undefined,
        tabId: undefined,
        query: value,
      },
    });
  }

  setParams(groupId: string, tabId?: number) {
    return this.navigate([], {
      relativeTo: this.activeRoute,
      queryParams: {
        groupId,
        tabId,
        query: undefined,
      },
    });
  }

  navigate(commands: any[], extras: RouterExtras = {}): Promise<boolean> {
    return this.router.navigate(commands, {
      replaceUrl: true,
      ...extras,
    });
  }
}
