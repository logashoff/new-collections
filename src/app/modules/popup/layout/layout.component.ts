import { MatFabMenu } from '@angular-material-extensions/fab-menu';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TooltipPosition } from '@angular/material/tooltip';
import { TabGroup } from '@lib';
import { Observable } from 'rxjs';
import { TabService } from 'src/app/services';

/**
 * Icons used by main menu.
 */
export enum MenuIcons {
  Options = 'settings',
  Save = 'star',
}

/**
 * Main menu action IDs.
 */
export enum MenuAction {
  Options = 1,
  Save = 2,
}

/**
 * Tooltip position for menu items.
 */
export const tooltipPosition: TooltipPosition = 'left';

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
   * Main menu items.
   */
  readonly menuItems: MatFabMenu[] = [
    {
      id: MenuAction.Save,
      icon: MenuIcons.Save,
      tooltip: 'Save',
      tooltipPosition,
    },
    {
      id: MenuAction.Options,
      icon: MenuIcons.Options,
      tooltip: 'Options',
      tooltipPosition,
    },
  ];

  constructor(private tabsService: TabService) {}

  /**
   * Navigates to options page.
   */
  private openOptions() {
    chrome.runtime.openOptionsPage();
  }

  /**
   * Handles main menu items actions.
   */
  async handleMenuAction(menuAction: MenuAction) {
    switch (menuAction) {
      case MenuAction.Save:
        await this.tabsService.saveCurrentWindowTabs();
        this.openOptions();
        break;
      case MenuAction.Options:
        this.openOptions();
        break;
    }
  }
}
