import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TabService } from 'src/app/services';
import { restoreTabs, TabGroup } from 'src/app/utils';

/**
 * @description
 * 
 * Panel header controls container.
 */
@Component({
  selector: 'app-group-controls',
  templateUrl: './group-controls.component.html',
  styleUrls: ['./group-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupControlsComponent {
  @Input() group: TabGroup;

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
