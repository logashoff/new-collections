import { MatFabMenu } from '@angular-material-extensions/fab-menu';
import { Injectable } from '@angular/core';
import { TooltipPosition } from '@angular/material/tooltip';
import { BehaviorSubject } from 'rxjs';
import { exportTabs, getSavedTabs, importTabs, queryCurrentWindow } from 'src/app/utils';
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
        try {
          const tabs = await queryCurrentWindow();
          const tabGroup = await this.tabsService.getTabGroup(tabs);
          await this.tabsService.saveTabGroup(tabGroup);
          this.openOptions();
        } catch (e) {
          this.tabsService.displayMessage(e);
        }
        break;
      case Action.Options:
        this.openOptions();
        break;
      case Action.Export:
        const tabGroups = await getSavedTabs();
        if (tabGroups?.length > 0) {
          exportTabs(tabGroups);
        } else {
          this.tabsService.displayMessage('Empty list cannot be saved');
        }
        break;
      case Action.Import:
        const importedTabs = await importTabs();
        const savedTabs = await getSavedTabs();
        await this.tabsService.saveTabGroups([...(importedTabs || []), ...(savedTabs || [])]);
        break;
    }
  }
}
