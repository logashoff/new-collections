import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { NavService, TabService } from '../../services';
import { BrowserTab, BrowserTabs } from '../../utils';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'nc-popup-search',
  imports: [AsyncPipe, SearchComponent],
  templateUrl: './popup-search.component.html',
  styleUrl: './popup-search.component.scss',
})
export class PopupSearchComponent implements OnInit {
  searchSource$: Observable<BrowserTabs>;

  constructor(
    private navService: NavService,
    private tabService: TabService
  ) {}

  ngOnInit() {
    this.searchSource$ = this.tabService.tabs$;
  }

  /**
   * Scroll specified tab into view
   */
  async findItem(tab: BrowserTab) {
    const group = await this.tabService.getGroupByTab(tab);

    if (group) {
      await this.navService.navigate(['/popup', 'main'], {
        queryParams: {
          groupId: group.id,
          tabId: tab.id,
          query: undefined,
        },
      });
    }
  }
}
