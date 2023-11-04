import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { TabService, HomeService } from 'src/app/services';
import { BrowserTabs, TabGroups, Timeline, TopSites, trackByLabel } from 'src/app/utils';
import { SharedModule } from '../shared';

/**
 * @description
 *
 * Home / New Tap component.
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, SharedModule],
  providers: [ HomeService ]
})
export class HomeComponent {
  readonly trackByLabel = trackByLabel;

  readonly devicesTimeline$: Observable<Timeline>;
  readonly hasAnyData$: Observable<boolean>;
  readonly searchSource$: Observable<BrowserTabs>;
  readonly timeline$: Observable<Timeline>;
  readonly topSites$: Observable<TopSites>;

  constructor(private homeService: HomeService, private tabService: TabService) {
    this.devicesTimeline$ = this.homeService.devicesTimeline$;
    this.hasAnyData$ = this.homeService.hasAnyData$;
    this.searchSource$ = this.homeService.searchSource$;
    this.timeline$ = this.homeService.timeline$;
    this.topSites$ = this.homeService.topSites$;
  }

  /**`
   * Removes all items in timeline section
   */
  async removeGroups(groups: TabGroups) {
    await this.tabService.removeTabGroups(groups);
  }
}
