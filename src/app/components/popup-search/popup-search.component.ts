import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { NavService, TabService } from '../../services';
import { BrowserTab, BrowserTabs } from '../../utils';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'nc-popup-search',
  templateUrl: './popup-search.component.html',
  styleUrl: './popup-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, SearchComponent],
})
export class PopupSearchComponent {
  readonly #navService = inject(NavService);
  readonly #tabService = inject(TabService);

  readonly searchSource$: Observable<BrowserTabs> = this.#tabService.tabs$;

  /**
   * Scroll specified tab into view
   */
  async findItem(tab: BrowserTab) {
    const group = await this.#tabService.getGroupByTab(tab);

    if (group) {
      await this.#navService.navigate(['/popup', 'main'], {
        queryParams: {
          groupId: group.id,
          tabId: tab.id,
          query: undefined,
        },
      });
    }
  }
}
