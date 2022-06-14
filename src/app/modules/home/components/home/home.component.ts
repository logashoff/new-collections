import { MatFabMenu } from '@angular-material-extensions/fab-menu';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuService, TabService } from 'src/app/services';
import { TabGroups, trackByLabel } from 'src/app/utils';
import { HomeService } from '../../services';

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
})
export class HomeComponent {
  readonly devicesTimeline$ = this.homeService.devicesTimeline$;
  readonly hasAnyData$ = this.homeService.hasAnyData$;
  readonly searchSource$ = this.homeService.searchSource$;
  readonly timeline$ = this.homeService.timeline$;
  readonly topSites$ = this.homeService.topSites$;

  readonly trackByLabel = trackByLabel;

  /**
   * Main menu items.
   */
  readonly menuItems$: Observable<MatFabMenu[]> = this.menuService.menuItems$;

  constructor(private menuService: MenuService, private homeService: HomeService, private tabService: TabService) {}

  /**`
   * Removes all items in timeline section
   */
  async removeGroups(groups: TabGroups) {
    await this.tabService.removeTabGroups(groups);
  }
}
