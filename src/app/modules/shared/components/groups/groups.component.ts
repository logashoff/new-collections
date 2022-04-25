import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { restoreTabs, TabGroup } from '@lib';
import { TabService } from 'src/app/services';

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
  encapsulation: ViewEncapsulation.None,
})
export class GroupsComponent {
  /**
   * List of tab groups to render.
   */
  @Input() groups: TabGroup[];

  constructor(private tabService: TabService) {}

  /**
   * Removes `group` from tab group list and storage.
   */
  removeTabs(group: TabGroup) {
    this.tabService.removeTabGroup(group);
  }

  /**
   * Opens all tabs from `group` object.
   */
  restoreTabs(group: TabGroup) {
    restoreTabs(group);
  }
}
