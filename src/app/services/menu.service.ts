import { MatFabMenu } from '@angular-material-extensions/fab-menu';
import { Injectable } from '@angular/core';
import { TooltipPosition } from '@angular/material/tooltip';
import { BehaviorSubject } from 'rxjs';
import { exportTabs, getSavedTabs, importTabs } from 'src/app/utils';
import { TabService } from './tab.service';

/**
 * Icons used by main menu.
 */
export enum ActionIcons {
  Export = 'download',
  Import = 'file_upload',
  Options = 'settings',
  Save = 'bookmark',
}

/**
 * Main menu action IDs.
 */
export enum Action {
  Export = 1,
  Import = 2,
  Options = 3,
  Save = 4,
}

/**
 * Tooltip position for menu items.
 */
export const tooltipPosition: TooltipPosition = 'left';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private readonly menuItemsSubject = new BehaviorSubject<MatFabMenu[]>([
    {
      id: Action.Save,
      icon: ActionIcons.Save,
      tooltip: 'Save',
      tooltipPosition,
      color: 'accent',
    },
    {
      id: Action.Export,
      icon: ActionIcons.Export,
      tooltip: 'Export',
      tooltipPosition,
    },
    {
      id: Action.Import,
      icon: ActionIcons.Import,
      tooltip: 'Import',
      tooltipPosition,
    },
    {
      id: Action.Options,
      icon: ActionIcons.Options,
      tooltip: 'Options',
      tooltipPosition,
    },
  ]);

  readonly menuItems$ = this.menuItemsSubject.asObservable();

  constructor(private tabsService: TabService) {}

  /**
   * Navigates to options page.
   */
  private openOptions() {
    chrome.runtime.openOptionsPage();
  }

  async handleMenuAction(menuAction: Action) {
    switch (menuAction) {
      case Action.Save:
        await this.tabsService.saveCurrentWindowTabs();
        this.openOptions();
        break;
      case Action.Options:
        this.openOptions();
        break;
      case Action.Export:
        exportTabs(await getSavedTabs());
        break;
      case Action.Import:
        const importedTabs = await importTabs();
        const savedTabs = await getSavedTabs();
        await this.tabsService.saveTabGroups([...(importedTabs || []), ...(savedTabs || [])]);
        break;
    }
  }
}
