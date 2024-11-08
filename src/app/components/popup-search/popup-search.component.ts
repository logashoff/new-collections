import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { NavService, TabService } from '../../services';
import { BrowserTab, BrowserTabs } from '../../utils';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'app-popup-search',
  standalone: true,
  imports: [CommonModule, SearchComponent],
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
    this.searchSource$ = this.tabService.tabs$.pipe(map((tabs) => tabs ?? []));
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
