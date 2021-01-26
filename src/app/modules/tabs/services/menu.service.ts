import { MatFabMenu } from '@angular-material-extensions/fab-menu';
import { Injectable } from '@angular/core';
import { TooltipPosition } from '@angular/material/tooltip';
import { exportTabs, getSavedTabs, importTabs } from '@lib';
import { TabService } from 'src/app/services';

/**
 * Icons used by main menu.
 */
export enum MenuIcons {
  Export = 'publish',
  Import = 'get_app',
  Save = 'save_alt',
}

/**
 * Main menu action IDs.
 */
export enum MenuAction {
  Export = 1,
  Import = 2,
  Save = 3,
}

/**
 * Tooltip position for menu items.
 */
export const tooltipPosition: TooltipPosition = 'left';

/**
 * Main menu items.
 */
export const menuItems: MatFabMenu[] = [
  {
    id: MenuAction.Save,
    icon: MenuIcons.Save,
    tooltip: 'Save',
    tooltipPosition,
  },
  {
    id: MenuAction.Export,
    icon: MenuIcons.Export,
    tooltip: 'Export',
    tooltipPosition,
  },
  {
    id: MenuAction.Import,
    icon: MenuIcons.Import,
    tooltip: 'Import',
    tooltipPosition,
  },
];

/**
 * @description
 *
 * Main menu service.
 */
@Injectable({
  providedIn: 'root',
})
export class MenuService {
  constructor(private tabsService: TabService) {}

  /**
   * Handles main menu items actions.
   */
  async handleMenuAction(menuAction: MenuAction) {
    switch (menuAction) {
      case MenuAction.Save:
        await this.tabsService.saveCurrentWindowTabs();
        break;
      case MenuAction.Export:
        exportTabs(await getSavedTabs());
        break;
      case MenuAction.Import:
        const tabGroups = await importTabs();
        await this.tabsService.saveTabGroups(tabGroups);
        break;
    }
  }
}
