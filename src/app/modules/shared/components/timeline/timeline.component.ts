import { ChangeDetectionStrategy, Component } from '@angular/core';
import isNil from 'lodash/isNil';
import { filter } from 'rxjs';
import { TabService } from 'src/app/services';
import { TabGroups, TimelineElement, trackByKey } from 'src/app/utils';

/**
 * @description
 *
 * Displays tab groups separated by time.
 */
@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent {
  readonly timeline$ = this.tabService.groupsTimeline$.pipe(filter((timeline) => !isNil(timeline)));

  readonly trackByKey = trackByKey;

  constructor(private tabService: TabService) {}

  /**`
   * Removes all items in timeline section
   */
  async removeGroups(groups: TimelineElement[]) {
    await this.tabService.removeTabGroups(groups as TabGroups);
  }
}
