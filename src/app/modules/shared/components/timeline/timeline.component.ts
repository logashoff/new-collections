import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TabService } from 'src/app/services';
import { TabGroups, trackByLabel } from 'src/app/utils';

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
  readonly timeline$ = this.tabService.groupsTimeline$;

  readonly trackByLabel = trackByLabel;

  constructor(private tabService: TabService) {}

  /**`
   * Removes all items in timeline section
   */
  async removeGroups(groups: TabGroups) {
    await this.tabService.removeTabGroups(groups);
  }
}
