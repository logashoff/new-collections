import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { HomeService, TabService } from '../../services/index';
import { Action, ActionIcon, CollectionActions, TabGroups, Timeline } from '../../utils/index';
import { EmptyComponent } from '../empty/empty.component';
import { GroupsComponent } from '../groups/groups.component';
import { TimelineElementComponent } from '../timeline-element/timeline-element.component';

/**
 * @description
 *
 * New Tab content component.
 */
@Component({
  selector: 'app-new-tab-content',
  templateUrl: './new-tab-content.component.html',
  styleUrls: ['./new-tab-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, EmptyComponent, GroupsComponent, TimelineElementComponent],
})
export class NewTabContentComponent {
  readonly defaultActions: CollectionActions = [
    {
      action: Action.Import,
      icon: ActionIcon.Import,
      label: 'importCollections',
      color: 'primary',
    },
  ];

  readonly devicesTimeline$: Observable<Timeline>;
  readonly hasAnyData$: Observable<boolean>;
  readonly timeline$: Observable<Timeline>;

  constructor(
    homeService: HomeService,
    private tabService: TabService
  ) {
    this.devicesTimeline$ = homeService.devicesTimeline$;
    this.hasAnyData$ = homeService.hasAnyData$;
    this.timeline$ = homeService.timeline$;
  }

  /**`
   * Removes all items in timeline section
   */
  async removeGroups(groups: TabGroups) {
    await this.tabService.removeTabGroups(groups);
  }
}
