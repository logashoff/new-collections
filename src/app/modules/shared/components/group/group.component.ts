import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { restoreTabs, TabGroup } from '@lib';
import { BehaviorSubject } from 'rxjs';
import { TabService } from 'src/app/services';

/**
 * @description
 *
 * Material Card that contains list of tabs, actions menu and basic information about tab group.
 */
@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupComponent {
  /**
   * Tab group that will be used for rendering.
   */
  readonly group$ = new BehaviorSubject<TabGroup>(null);

  /**
   * Sets tab group.
   */
  @Input() set group(group: TabGroup) {
    this.group$.next(group);
  }

  /**
   * Returns tab group.
   */
  get group(): TabGroup {
    return this.group$.value;
  }

  constructor(private tabService: TabService) {}

  /**
   * Removes `group` from tab group list and storage.
   */
  removeTabs() {
    this.tabService.removeTabGroup(this.group);
  }

  /**
   * Opens all tabs from `group` object.
   */
  restoreTabs() {
    restoreTabs(this.group);
  }
}
