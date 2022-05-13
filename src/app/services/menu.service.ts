import { MatFabMenu } from '@angular-material-extensions/fab-menu';
import { Injectable } from '@angular/core';
import { TooltipPosition } from '@angular/material/tooltip';
import { BehaviorSubject } from 'rxjs';
import { Action, ActionIcons, exportTabs, getSavedTabs, importTabs, queryCurrentWindow } from 'src/app/utils';
import { TabService } from './tab.service';

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
    try {
      switch (menuAction) {
        case Action.Save:
          const tabs = await queryCurrentWindow();
          const tabGroup = await this.tabsService.createTabGroup(tabs);

          if (tabGroup?.tabs?.length > 0) {
            await this.tabsService.addTabGroup(tabGroup);
            this.openOptions();
          } else {
            this.tabsService.displayMessage('Opened tabs cannot be saved');
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
          await this.tabsService.addTabGroups(importedTabs);
          break;
      }
    } catch (e) {
      this.tabsService.displayMessage(e);
    }
  }
}
