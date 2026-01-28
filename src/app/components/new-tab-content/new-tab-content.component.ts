import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { GroupService } from 'src/app/services/group.service';
import { DataTestIdDirective } from '../../directives';
import { TranslatePipe } from '../../pipes';
import { CollectionsService, HomeService, TabService } from '../../services';
import {
  Action,
  ActionIcon,
  Actions,
  CollectionActions,
  GroupAction,
  GroupActions,
  restoreTabs,
  TabGroups,
  Tabs,
  Timeline,
  translate,
} from '../../utils';
import { EmptyComponent } from '../empty/empty.component';
import { GroupsComponent } from '../groups/groups.component';
import { TimelineElementComponent } from '../timeline-element/timeline-element.component';

/**
 * @description
 *
 * New Tab content component.
 */
@Component({
  selector: 'nc-new-tab-content',
  templateUrl: './new-tab-content.component.html',
  styleUrls: ['./new-tab-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, DataTestIdDirective, EmptyComponent, GroupsComponent, TimelineElementComponent, TranslatePipe],
})
export class NewTabContentComponent {
  readonly #collection = inject(CollectionsService);
  readonly #homeService = inject(HomeService);
  readonly #tabService = inject(TabService);
  readonly groupService = inject(GroupService);

  readonly defaultActions: CollectionActions = [
    {
      action: Action.Import,
      icon: ActionIcon.Import,
      label: translate('importCollections'),
      color: 'primary',
    },
  ];

  readonly deviceActions: GroupActions = [
    {
      action: Action.Restore,
      icon: ActionIcon.Restore,
      label: 'restore',
    },
    {
      action: Action.Add,
      icon: ActionIcon.Bookmark,
      label: 'save',
    },
  ];

  readonly devicesTimeline$: Observable<Timeline> = this.#homeService.devicesTimeline$;
  readonly timeline$: Observable<Timeline> = this.#homeService.timeline$;

  readonly tabActions: Actions = [Action.Edit, Action.Delete];

  /**`
   * Removes all items in timeline section
   */
  async removeGroups(groups: TabGroups) {
    await this.#tabService.removeTabGroups(groups);
  }

  handleDeviceAction({ action, group }: GroupAction, label: string) {
    switch (action) {
      case Action.Add:
        void this.#collection.selectTabs(group.tabs as Tabs);
        break;
      case Action.Restore:
        void restoreTabs(group.tabs, label);
        break;
    }
  }
}
