import { inject, Injectable } from '@angular/core';

import {
  Action,
  ActionIcon,
  formatDate,
  GroupAction,
  GroupActions,
  queryCurrentWindow,
  restoreTabs,
  Tabs,
} from '../utils';
import { TabService } from './tab.service';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  readonly #tabService = inject(TabService);

  readonly commonActions: Readonly<GroupActions> = Object.freeze([
    {
      action: Action.Delete,
      icon: ActionIcon.Delete,
      label: 'delete',
    },
    {
      action: Action.Restore,
      icon: ActionIcon.Restore,
      label: 'restore',
    },
    {
      action: Action.Add,
      icon: ActionIcon.Add,
      label: 'addTabs',
    },
  ]);

  async handleAction({ action, group }: GroupAction) {
    if (group) {
      switch (action) {
        case Action.Add:
          const tabs: Tabs = await queryCurrentWindow();
          this.#tabService.addTabs(group, tabs);
          break;
        case Action.Restore:
          restoreTabs(group.tabs, formatDate(group.timestamp));
          break;
        case Action.Delete:
          this.#tabService.removeTabGroup(group);
          break;
      }
    }
  }
}
