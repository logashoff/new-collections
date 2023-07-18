import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { TabService } from 'src/app/services';
import { TabGroups, Timeline, trackByLabel } from 'src/app/utils';

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
  readonly timeline$: Observable<Timeline>;

  readonly trackByLabel = trackByLabel;

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
