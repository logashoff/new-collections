import { MatFabMenu } from '@angular-material-extensions/fab-menu';
import { Injectable } from '@angular/core';
import { TooltipPosition } from '@angular/material/tooltip';
import saveAs from 'file-saver';
import { lastValueFrom, Observable, of } from 'rxjs';
import selectFiles from 'select-files';
import {
  Action,
  ActionIcon,
  Collections,
  getCollections,
  ignoreUrlsRegExp,
  queryCurrentWindow,
  TabGroup,
} from 'src/app/utils';
import { MessageService } from './message.service';
import { NavService } from './nav.service';
import { TabService } from './tab.service';

/**
 * Tooltip position for menu items.
 */
export const tooltipPosition: TooltipPosition = 'left';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  /**
   * All available FAB menu items.
   */
  readonly menuItems$: Observable<MatFabMenu[]> = of([
    {
      id: Action.Save,
      icon: ActionIcon.Save,
      tooltip: 'Add Bookmarks',
      tooltipPosition,
      color: 'accent',
    },
    {
      id: Action.Export,
      icon: ActionIcon.Export,
      tooltip: 'Export Collections',
      tooltipPosition,
    },
    {
      id: Action.Import,
      icon: ActionIcon.Import,
      tooltip: 'Import Collections',
      tooltipPosition,
    },
    {
      id: Action.Settings,
      icon: ActionIcon.Settings,
      tooltip: 'Settings',
      tooltipPosition,
    },
  ]);

  constructor(private tabsService: TabService, private nav: NavService, private message: MessageService) {}

  /**
   * Navigates to options page.
   */
  private openOptions() {
    chrome.runtime.openOptionsPage();
  }

  /**
   * Writes provided tab groups to JSON file.
   */
  private exportCollections(collections: Collections) {
    const blob = new Blob([JSON.stringify(collections, null, 2)], { type: 'text/json;charset=utf-8' });
    saveAs(blob, `new-collections-${new Date().toISOString()}.json`);
  }

  /**
   * Import tab groups JSON file from file system.
   */
  private async importCollections(): Promise<Collections> {
    return new Promise(async (resolve, reject) => {
      try {
        const files = await selectFiles({ accept: '.json', multiple: false });

        const reader = new FileReader();
        reader.readAsText(files[0], 'utf-8');

        reader.onload = ({ target: { result } }) => {
          resolve(JSON.parse(result as string));
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  async handleMenuAction(menuAction: Action) {
    try {
      let collections: Collections;

      switch (menuAction) {
        case Action.Save:
          let tabs = await queryCurrentWindow();
          tabs = tabs?.filter(({ url }) => !ignoreUrlsRegExp.test(url));

          if (tabs?.length > 0) {
            const bottomSheetRef = this.tabsService.openTabsSelector(tabs);
            tabs = await lastValueFrom(bottomSheetRef.afterDismissed());
            if (tabs?.length > 0) {
              const tabGroup = await this.tabsService.createTabGroup(tabs);
              await this.tabsService.addTabGroup(tabGroup);
              this.nav.setParams(tabGroup.id);
            }
          } else {
            this.message.open('Tab list is invalid');
          }
          break;
        case Action.Settings:
          this.openOptions();
          break;
        case Action.Export:
          collections = await getCollections();
          if (collections?.length > 0) {
            this.exportCollections(collections);
          } else {
            this.message.open('Empty list cannot be exported');
          }
          break;
        case Action.Import:
          collections = await this.importCollections();
          const tabGroups = collections.map((collection) => new TabGroup(collection));
          await this.tabsService.addTabGroups(tabGroups);
          break;
      }
    } catch (e) {
      this.message.open(e);
    }
  }
}
