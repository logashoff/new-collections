import { ChangeDetectionStrategy, Component } from '@angular/core';
import { exportTabs, getSavedTabs, importTabs, TabGroup } from '@lib';
import { Observable } from 'rxjs';
import { TabService } from 'src/app/services';

/**
 * @description
 *
 * Extension Options page.
 */
@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsComponent {
  /**
   * Data source for stored tab groups.
   */
  readonly groups$: Observable<TabGroup[]> = this.tabsService.tabGroups$;

  constructor(private tabsService: TabService) {}

  /**
   * Imports tabs data from JSON file.
   */
  async import() {
    const importedTabs = await importTabs();
    const savedTabs = await getSavedTabs();

    await this.tabsService.saveTabGroups([...(importedTabs || []), ...(savedTabs || [])]);
  }

  /**
   * Exports currently open tabs to JSON file.
   */
  async export() {
    exportTabs(await getSavedTabs());
  }
}
