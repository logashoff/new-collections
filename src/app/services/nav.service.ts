import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged, map, Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavService {
  /**
   * Group ID set by URL query params
   */
  readonly paramsGroupId$: Observable<string> = this.activeRoute.queryParams.pipe(
    distinctUntilChanged((prev, curr) => prev.groupId === curr.groupId),
    map((params) => params.groupId),
    shareReplay(1)
  );

  /**
   * Group ID set by URL query params
   */
  readonly paramsTabId$: Observable<number> = this.activeRoute.queryParams.pipe(
    distinctUntilChanged((prev, curr) => prev.tabId === curr.tabId),
    map((params) => params.tabId),
    shareReplay(1)
  );

  /**
   * Group ID set by URL query params
   */
  readonly paramsSearch$: Observable<string> = this.activeRoute.queryParams.pipe(
    distinctUntilChanged((prev, curr) => prev.search === curr.search),
    map((params) => params.search as string),
    shareReplay(1)
  );

  /**
   * Checks is current nav state is popup.
   * TODO: Does chrome API has extension type indicator?
   */
  get isPopup(): boolean {
    return this.router.url.match(/popup/gi)?.length > 0;
  }

  constructor(private activeRoute: ActivatedRoute, private router: Router) {}

  reset() {
    this.router.navigate([], {
      relativeTo: this.activeRoute,
      queryParams: {
        groupId: undefined,
        tabId: undefined,
        search: undefined,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  search(value: string) {
    this.router.navigate([], {
      relativeTo: this.activeRoute,
      queryParams: {
        groupId: undefined,
        tabId: undefined,
        search: value,
      },
      replaceUrl: true,
    });
  }

  setParams(groupId: string, tabId?: number) {
    this.router.navigate([], {
      relativeTo: this.activeRoute,
      queryParams: {
        groupId,
        tabId,
        search: undefined,
      },
      replaceUrl: true,
    });
  }
}
