import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { flatMap } from 'lodash-es';
import { Observable, map, shareReplay } from 'rxjs';
import { HomeService, NavService, TabService } from '../../services/index';
import { BrowserTab, BrowserTabs } from '../../utils/index';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'app-new-tab-search',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SearchComponent],
  templateUrl: './new-tab-search.component.html',
  styleUrl: './new-tab-search.component.scss',
})
export class NewTabSearchComponent implements OnInit {
  searchSource$: Observable<BrowserTabs>;
  devices$: Observable<BrowserTabs>;

  constructor(
    private homeService: HomeService,
    private navService: NavService,
    private tabService: TabService
  ) {}

  ngOnInit() {
    this.searchSource$ = this.tabService.tabs$;
    this.devices$ = this.homeService.devices$.pipe(
      map((devices) => flatMap(devices?.map((device) => this.homeService.getTabsFromSessions(device.sessions)))),
      shareReplay(1)
    );
  }

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
