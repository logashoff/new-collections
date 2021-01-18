import { Injectable } from '@angular/core';
import { MenuAction } from 'src/app/models';
import { TabService } from 'src/app/services';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  constructor(private tabsService: TabService) {}

  async handleMenuAction(menuAction: MenuAction) {
    switch (menuAction) {
      case MenuAction.Save:
        await this.tabsService.saveCurrentWindowTabs();
        break;
      case MenuAction.Export:
        break;
      case MenuAction.Import:
        break;
    }
  }
}
