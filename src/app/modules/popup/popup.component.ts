import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable, map } from 'rxjs';
import { TabService } from 'src/app/services';
import { Action, ActionIcon, BrowserTabs, CollectionActions, Timeline } from 'src/app/utils';
import { EmptyComponent, SearchComponent, TimelineComponent } from '../shared';

/**
 * @description
 *
 * Root component for extension popup that renders stored tab groups data.
 */
@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, EmptyComponent, SearchComponent, TimelineComponent],
})
export class PopupComponent {
  readonly defaultActions: CollectionActions = [
    {
      action: Action.Save,
      icon: ActionIcon.Save,
      label: 'addCollection',
      color: 'primary',
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
