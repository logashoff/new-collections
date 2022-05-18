import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { keyBy } from 'lodash';
import { lastValueFrom } from 'rxjs';
import { TabService } from 'src/app/services';
import { BrowserTab, ignoreUrlsRegExp, queryCurrentWindow, restoreTabs, Tab, TabGroup } from 'src/app/utils';
import { TabsSelectorComponent } from '../tabs-selector/tabs-selector.component';

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
  removeTabs() {
    this.tabService.removeTabGroup(this.group);
  }

  /**
   * Opens all tabs from `group` object.
   */
  restoreTabs() {
    restoreTabs(this.group);
  }

  /**
   * Opens browser tab selector to add new tabs to current group.
   */
  async addTabs() {
    const tabs: Tab[] = await queryCurrentWindow();

    this.tabService.addTabs(this.group, tabs);
  }
}
