import { MatFabMenu } from '@angular-material-extensions/fab-menu';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Action, MenuService } from 'src/app/services';

/**
 * @description
 *
 * Fab menu.
 */
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  /**
   * Menu items.
   */
  @Input() menuItems: MatFabMenu[];

  constructor(private menuService: MenuService) {}

  /**
   * Handles main menu items actions.
   */
  async handleMenuAction(menuAction: Action) {
    this.menuService.handleMenuAction(menuAction);
  }
}
