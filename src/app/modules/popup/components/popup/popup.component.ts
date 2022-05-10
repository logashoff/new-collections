import { MatFabMenu } from '@angular-material-extensions/fab-menu';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MenuService, TabService } from 'src/app/services';
import { Action, Timeline } from 'src/app/utils';

/**
 * @description
 *
 * Root component for extension popup that renders stored tab groups data.
 */
@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupComponent {

  /**
   * Tab groups grouped by time
   */
  readonly groupsTimeline$: Observable<Timeline> = this.tabsService.groupsTimeline$;

  /**
   * Main menu items.
   */
  readonly menuItems$: Observable<MatFabMenu[]> = this.menuService.menuItems$.pipe(
    map((menuItems) => menuItems.filter((item) => ![Action.Import].includes(item.id as Action)))
  );

  constructor(private tabsService: TabService, private menuService: MenuService) {}
}
