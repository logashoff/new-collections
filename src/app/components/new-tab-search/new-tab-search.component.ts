import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';

import { HomeService, NavService, TabService } from '../../services';
import { BrowserTab, BrowserTabs } from '../../utils';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'nc-new-tab-search',
  templateUrl: './new-tab-search.component.html',
  styleUrl: './new-tab-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, SearchComponent],
})
export class NewTabSearchComponent {
  readonly #homeService = inject(HomeService);
  readonly #navService = inject(NavService);
  readonly #tabService = inject(TabService);

  readonly searchSource$: Observable<BrowserTabs> = this.#tabService.tabs$;

  readonly devices$: Observable<BrowserTabs> = this.#homeService.devices$.pipe(
    map((devices) => devices?.map((device) => this.#homeService.getTabsFromSessions(device.sessions)).flat()),
    shareReplay(1)
  );

  /**
   * Scroll specified tab into view
   */
  async findItem(tab: BrowserTab) {
    const group = await this.#tabService.getGroupByTab(tab);

    if (group) {
      await this.#navService.navigate(['/new-tab', 'main'], {
        queryParams: {
          groupId: group.id,
          tabId: tab.id,
          query: undefined,
        },
      });
    }
  }
}
