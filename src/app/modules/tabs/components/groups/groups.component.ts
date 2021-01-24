import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TabGroup } from 'lib';

/**
 * @description
 *
 * Displays list of tab groups.
 */
@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupsComponent {
  /**
   * List of tab groups to render.
   */
  @Input() groups: TabGroup[];
}
