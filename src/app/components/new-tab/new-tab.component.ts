import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isNil } from 'lodash-es';
import { Observable, combineLatest, map, shareReplay } from 'rxjs';

import { KeyListenerDirective } from '../../directives';
import { HomeService, KeyService, NavService } from '../../services';
import { TopSites, routeAnimations, scrollTop } from '../../utils';
import { SearchFormComponent } from '../search-form/search-form.component';
import { TopSitesComponent } from '../top-sites/top-sites.component';

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
  animations: [routeAnimations],
  imports: [RouterOutlet, CommonModule, SearchFormComponent, TopSitesComponent],
  providers: [KeyService],
})
export class NewTabComponent extends KeyListenerDirective implements OnInit {
  readonly urlChanges$: Observable<string> = this.navService.pathChanges$;
  readonly topSites$: Observable<TopSites> = this.homeService.topSites$;
  readonly hasData$: Observable<boolean> = this.homeService.hasAnyData$;

  /**
   * Check if search is active
   */
  readonly isSearchActive$ = this.navService.pathChanges$.pipe(
    map(() => this.navService.isActive('search')),
    shareReplay(1)
  );

  /**
   * Hide top sites component when search is active
   */
  hideTopSites$: Observable<boolean>;

  constructor(
    private readonly homeService: HomeService,
    private readonly navService: NavService
  ) {
    super();
  }

  ngOnInit() {
    this.hideTopSites$ = combineLatest([this.topSites$, this.isSearchActive$]).pipe(
      map(([topSites, isSearchActive]) => isNil(topSites) || topSites?.length === 0 || isSearchActive),
      shareReplay(1)
    );
  }

  async navigate(...command: string[]) {
    await this.navService.navigate(['/new-tab', ...command]);
    scrollTop();
  }

  onBlur() {
    this.clearActive();
  }
}
