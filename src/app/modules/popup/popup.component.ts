import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable, map } from 'rxjs';
import { TabService } from 'src/app/services';
import { Action, BrowserTabs, CollectionActions, Timeline } from 'src/app/utils';
import { SharedModule } from '../shared';

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
  standalone: true,
  imports: [CommonModule, SharedModule],
})
export class PopupComponent {
  readonly defaultActions: CollectionActions = [
    {
      action: Action.Save,
      label: 'addBookmarks',
    },
  ];
  
  /**
   * Tab groups grouped by time
   */
  readonly groupsTimeline$: Observable<Timeline>;

  readonly searchSource$: Observable<BrowserTabs>;

  constructor(private tabsService: TabService) {
    this.groupsTimeline$ = this.tabsService.groupsTimeline$;
    this.searchSource$ = this.tabsService.tabs$.pipe(map((tabs) => tabs ?? []));
  }
}
