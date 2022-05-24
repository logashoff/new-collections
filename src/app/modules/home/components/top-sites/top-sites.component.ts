import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { BrowserTab, TopSites, trackBySite, trackByTabId } from 'src/app/utils';
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
})
export class TopSitesComponent {
  readonly topSites$: Observable<TopSites> = this.homeService.topSites$;

  readonly trackBySite = trackBySite;
  readonly trackByTabId = trackByTabId;

  constructor(private homeService: HomeService) {}

  handleItemClick(tab: BrowserTab) {}
}
