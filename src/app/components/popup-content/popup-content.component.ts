import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';

import { TranslatePipe } from '../../pipes';
import { TabService } from '../../services';
import { Action, ActionIcon, CollectionActions, TabActions, TabGroups, Timeline, translate } from '../../utils';
import { EmptyComponent } from '../empty/empty.component';
import { GroupsComponent } from '../groups/groups.component';
import { TimelineElementComponent } from '../timeline-element/timeline-element.component';

/**
 * @description
 *
 * Content component for extension popup that renders stored tab groups data.
 */
@Component({
  selector: 'nc-popup-content',
  templateUrl: './popup-content.component.html',
  styleUrl: './popup-content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, EmptyComponent, GroupsComponent, TranslatePipe, TimelineElementComponent],
})
export class PopupContentComponent {
  readonly defaultActions: CollectionActions = [
    {
      action: Action.Save,
      icon: ActionIcon.Save,
      label: translate('addCollection'),
      color: 'primary',
    },
  ];

  /**
   * Tab groups grouped by time
   */
  readonly groupsTimeline$: Observable<Timeline>;

  readonly tabActions: TabActions = [
    {
      action: Action.Edit,
      icon: ActionIcon.Edit,
      label: 'edit',
    },
    {
      action: Action.Delete,
      icon: ActionIcon.Delete,
      label: 'delete',
    },
  ];

  constructor(private tabService: TabService) {
    this.groupsTimeline$ = this.tabService.groupsTimeline$;
  }

  /**`
   * Removes all items in timeline section
   */
  async removeGroups(groups: TabGroups) {
    await this.tabService.removeTabGroups(groups);
  }
}
