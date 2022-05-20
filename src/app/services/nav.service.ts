import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, shareReplay } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class NavService {
  /**
   * Group ID set by URL query params
   */
   readonly paramsGroupId$: Observable<string> = this.activeRoute.queryParams.pipe(
    map((params) => params.groupId),
    shareReplay(1)
  );

  /**
   * Group ID set by URL query params
   */
  readonly paramsTabId$: Observable<number> = this.activeRoute.queryParams.pipe(
    map((params) => params.tabId),
    shareReplay(1)
  );
  
  constructor(private activeRoute: ActivatedRoute, private router: Router) {}

  clear() {
    this.router.navigate([], {
      relativeTo: this.activeRoute,
      queryParams: {
        groupId: undefined,
        tabId: undefined,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  go(groupId: string, tabId: number) {
    this.router.navigate([], {
      relativeTo: this.activeRoute,
      queryParams: {
        groupId,
        tabId,
      },
      replaceUrl: true,
    });
  }
}
