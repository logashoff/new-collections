import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GroupByTime } from 'src/app/utils';

/**
 * @description
 *
 * Displays tab groups separated by time.
 */
@Component({
  selector: 'app-groups-by-time',
  templateUrl: './groups-by-time.component.html',
  styleUrls: ['./groups-by-time.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupsByTimeComponent {
  /**
   * Time labels
   */
  @Input() timeGroupLabels: string[];

  /**
   * Tab groups grouped by time
   */
  @Input() groupsByTime: GroupByTime;
}
