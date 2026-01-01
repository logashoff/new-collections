import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { combineLatest, map, Observable, shareReplay } from 'rxjs';

import { KeyListenerDirective } from '../../directives';
import { SearchFormComponent } from '../search-form/search-form.component';
import { HomeService, KeyService, NavService } from '../../services';
import { TopSitesComponent } from '../top-sites/top-sites.component';
import { scrollTop, TopSites } from '../../utils';

/**
 * @description
 *
 * New Tab root component.
 */
@Component({
  selector: 'nc-new-tab',
  templateUrl: './new-tab.component.html',
  styleUrls: ['./new-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [AsyncPipe, RouterOutlet, SearchFormComponent, TopSitesComponent],
  providers: [KeyService],
})
export class NewTabComponent extends KeyListenerDirective implements OnInit {
  readonly #homeService = inject(HomeService);
  readonly #navService = inject(NavService);

  readonly topSites$: Observable<TopSites> = this.#homeService.topSites$;
  readonly hasData$: Observable<boolean> = this.#homeService.hasAnyData$;

  /**
   * Check if search is active
   */
  readonly isSearchActive$ = this.#navService.pathChanges$.pipe(
    map(() => this.#navService.isActive('search')),
    shareReplay(1)
  );

  /**
   * Hide top sites component when search is active
   */
  hideTopSites$: Observable<boolean>;

  ngOnInit() {
    this.hideTopSites$ = combineLatest({ topSites: this.topSites$, isSearchActive: this.isSearchActive$ }).pipe(
      map(({ topSites, isSearchActive }) => !topSites || topSites?.length === 0 || isSearchActive),
      shareReplay(1)
    );
  }

  async navigate(...command: string[]) {
    await this.#navService.navigate(['/new-tab', ...command]);
    scrollTop();
  }

  onBlur() {
    this.clearActive();
  }
}
