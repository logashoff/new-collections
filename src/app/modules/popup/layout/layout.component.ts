import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TabGroup } from '@lib';
import { Observable } from 'rxjs';
import { TabService } from 'src/app/services';

/**
 * @description
 *
 * Root component for extension popup that renders stored tab groups data.
 */
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  /**
   * Data source for stored tab groups.
   */
  readonly groups$: Observable<TabGroup[]> = this.tabsService.tabGroups$;

  constructor(private tabsService: TabService) {}

  /**
   * Handles fab menu items action.
   */
  async handleSave() {
    await this.tabsService.saveCurrentWindowTabs();
    chrome.runtime.openOptionsPage();
  }
}
