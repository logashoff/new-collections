import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isNil } from 'lodash-es';
import { Observable, combineLatest, map, shareReplay } from 'rxjs';
import { StickyDirective } from '../../directives/index';
import { HomeService, NavService } from '../../services/index';
import { TopSites, scrollTop } from '../../utils/index';
import { SearchFormComponent } from '../search-form/search-form.component';
import { TopSitesComponent } from '../top-sites/top-sites.component';

/**
 * @description
 *
 * New Tab root component.
 */
@Component({
  selector: 'app-new-tab',
  templateUrl: './new-tab.component.html',
  styleUrls: ['./new-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [RouterOutlet, CommonModule, SearchFormComponent, StickyDirective, TopSitesComponent],
  providers: [HomeService],
})
export class NewTabComponent implements OnInit {
  topSites$: Observable<TopSites>;

  /**
   * Check if search is active
   */
  readonly isSearchActive$ = this.navService.url$.pipe(
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
  ) {}

  ngOnInit() {
    this.topSites$ = this.homeService.topSites$.pipe(shareReplay(1));

    this.hideTopSites$ = combineLatest([this.topSites$, this.isSearchActive$]).pipe(
      map(([topSites, isSearchActive]) => isNil(topSites) || isSearchActive),
      shareReplay(1)
    );
  }

  async navigate(...command: string[]) {
    await this.navService.navigate(['/new-tab', ...command]);
    scrollTop();
  }
}
