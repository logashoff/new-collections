import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { TopSites, trackBySite } from 'src/app/utils';
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

  readonly trackBySite = trackBySite;

  constructor(private homeService: HomeService) {}
}
