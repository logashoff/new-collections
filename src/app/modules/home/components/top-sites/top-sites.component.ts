import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { BrowserTab, getHostnameGroup, HostnameGroup, TopSites, trackBySite, trackByTabId } from 'src/app/utils';
import { HomeService } from '../../services';

/**
 * @description
 *
 * Top Sites expansion panel
 */
@Component({
  selector: 'app-top-sites',
  templateUrl: './top-sites.component.html',
  styleUrls: ['./top-sites.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TopSitesComponent {
  readonly topSites$: Observable<TopSites> = this.homeService.topSites$.pipe(shareReplay(1));

  readonly total$: Observable<number> = this.topSites$.pipe(
    map((topSites) => topSites.length),
    shareReplay(1)
  );

  readonly hostnameGroup$: Observable<HostnameGroup> = this.topSites$.pipe(
    map((topSites) => getHostnameGroup(topSites))
  );

  readonly trackBySite = trackBySite;
  readonly trackByTabId = trackByTabId;

  constructor(private homeService: HomeService) {}

  handleItemClick(tab: BrowserTab) {}
}
