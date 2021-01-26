import { MatFabMenu } from '@angular-material-extensions/fab-menu';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TabGroup } from '@lib';
import { Observable } from 'rxjs';
import { TabService } from 'src/app/services';

import { MenuAction, menuItems, MenuService } from '../services';

/**
 * @description
 *
 * Root component for extension popup that renders stored tab groups data.
 */
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  /**
   * Data source for stored tab groups.
   */
  readonly groups$: Observable<TabGroup[]> = this.tabsService.tabGroups$;

  /**
   * Fab button menu items.
   */
  menuItems: MatFabMenu[] = menuItems;

  constructor(private tabsService: TabService, private menuService: MenuService) {}

  /**
   * Handles fab menu items action.
   */
  handleMenuSelection(menuAction: MenuAction) {
    this.menuService.handleMenuAction(menuAction);
  }
}
