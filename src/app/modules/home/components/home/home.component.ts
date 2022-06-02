import { MatFabMenu } from '@angular-material-extensions/fab-menu';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuService } from 'src/app/services';
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
})
export class HomeComponent {
  readonly hasAnyData$ = this.homeService.hasAnyData$;
  readonly timeline$ = this.homeService.timeline$;
  readonly topSites$ = this.homeService.topSites$;
  readonly searchSource$ = this.homeService.searchSource$;

  /**
   * Main menu items.
   */
  readonly menuItems$: Observable<MatFabMenu[]> = this.menuService.menuItems$;

  constructor(private menuService: MenuService, private homeService: HomeService) {}
}
