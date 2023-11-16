import { Injectable } from '@angular/core';
import saveAs from 'file-saver';
import { lastValueFrom } from 'rxjs';
import selectFiles from 'select-files';
import {
  Action,
  Collections,
  getCollections,
  ignoreUrlsRegExp,
  openOptions,
  queryCurrentWindow,
  TabGroup,
  translate,
} from 'src/app/utils';
import { MessageService } from './message.service';
import { NavService } from './nav.service';
import { TabService } from './tab.service';

@Injectable({
  providedIn: 'root',
})
export class CollectionsService {
  readonly translate = translate();

  constructor(private message: MessageService, private nav: NavService, private tabsService: TabService) {}

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

  async handleAction(action: Action) {
    try {
      let collections: Collections;

      switch (action) {
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
            this.message.open(this.translate('invalidTabList'));
          }
          break;
        case Action.Settings:
          openOptions();
          break;
        case Action.Export:
          collections = await getCollections();
          if (collections?.length > 0) {
            this.exportCollections(collections);
          } else {
            this.message.open(this.translate('emptyListError'));
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
