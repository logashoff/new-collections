import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { flatMap } from 'lodash-es';
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
  readonly searchSource$: Observable<BrowserTabs> = this.tabService.tabs$;

  readonly devices$: Observable<BrowserTabs> = this.homeService.devices$.pipe(
    map((devices) => flatMap(devices?.map((device) => this.homeService.getTabsFromSessions(device.sessions)))),
    shareReplay(1)
  );

  constructor(
    private readonly homeService: HomeService,
    private readonly navService: NavService,
    private readonly tabService: TabService
  ) {}

  /**
   * Scroll specified tab into view
   */
  async findItem(tab: BrowserTab) {
    const group = await this.tabService.getGroupByTab(tab);

    if (group) {
      await this.navService.navigate(['/new-tab', 'main'], {
        queryParams: {
          groupId: group.id,
          tabId: tab.id,
          query: undefined,
        },
      });
    }
  }
}
