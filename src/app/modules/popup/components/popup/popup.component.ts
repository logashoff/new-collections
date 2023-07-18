import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { TabService } from 'src/app/services';
import { BrowserTabs, Timeline } from 'src/app/utils';

/**
 * @description
 *
 * Root component for extension popup that renders stored tab groups data.
 */
@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PopupComponent {
  /**
   * Tab groups grouped by time
   */
  readonly groupsTimeline$: Observable<Timeline>;

  readonly searchSource$: Observable<BrowserTabs>;

  constructor(private tabsService: TabService) {
    this.groupsTimeline$ = this.tabsService.groupsTimeline$;
    this.searchSource$ = this.tabsService.tabs$;
  }
}
