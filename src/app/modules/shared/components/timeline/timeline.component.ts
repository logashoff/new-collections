import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { TabService } from 'src/app/services';
import { TabGroups, Timeline } from 'src/app/utils';
import { GroupsComponent } from '../groups/groups.component';
import { TimelineElementComponent } from '../timeline-element/timeline-element.component';

/**
 * @description
 *
 * Displays tab groups separated by time.
 */
@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, GroupsComponent, TimelineElementComponent],
})
export class TimelineComponent {
  readonly timeline$: Observable<Timeline>;

  constructor(private tabService: TabService) {
    this.timeline$ = this.tabService.groupsTimeline$;
  }

  /**`
   * Removes all items in timeline section
   */
  async removeGroups(groups: TabGroups) {
    await this.tabService.removeTabGroups(groups);
  }
}
