import { MatFabMenu } from '@angular-material-extensions/fab-menu';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuAction, menuItems } from 'src/app/models';
import { TabGroup, TabService } from 'src/app/services';

import { MenuService } from '../services';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  readonly groups$: Observable<TabGroup[]> = this.tabsService.tabGroups$;

  menuItems: MatFabMenu[] = menuItems;

  constructor(private tabsService: TabService, private menuService: MenuService) {}

  handleMenuSelection(menuAction: MenuAction) {
    this.menuService.handleMenuAction(menuAction);
  }
}
