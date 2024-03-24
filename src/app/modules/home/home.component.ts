import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { flatMap } from 'lodash';
import { Observable, map, shareReplay } from 'rxjs';
import { HomeService, TabService } from 'src/app/services';
import { Action, ActionIcon, BrowserTabs, CollectionActions, TabGroups, Timeline, TopSites } from 'src/app/utils';
import {
  EmptyComponent,
  GroupsComponent,
  SearchComponent,
  TimelineElementComponent,
  TopSitesComponent,
} from '../shared';

/**
 * @description
 *
 * Home / New Tap component.
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    EmptyComponent,
    GroupsComponent,
    SearchComponent,
    TimelineElementComponent,
    TopSitesComponent,
  ],
  providers: [HomeService],
})
export class HomeComponent {
  readonly defaultActions: CollectionActions = [
    {
      action: Action.Import,
      icon: ActionIcon.Import,
      label: 'importCollections',
      color: 'primary',
    },
  ];

  readonly devicesTimeline$: Observable<Timeline>;
  readonly hasAnyData$: Observable<boolean>;
  readonly searchSource$: Observable<BrowserTabs>;
  readonly devices$: Observable<BrowserTabs>;
  readonly timeline$: Observable<Timeline>;
  readonly topSites$: Observable<TopSites>;

  constructor(private homeService: HomeService, private tabService: TabService) {
    this.devicesTimeline$ = this.homeService.devicesTimeline$;
    this.hasAnyData$ = this.homeService.hasAnyData$;
    this.searchSource$ = this.tabService.tabs$;
    this.devices$ = this.homeService.devices$.pipe(
      map((devices) => flatMap(devices?.map((device) => this.homeService.getTabsFromSessions(device.sessions)))),
      shareReplay(1)
    );
    this.timeline$ = this.homeService.timeline$;
    this.topSites$ = this.homeService.topSites$;
  }

  /**`
   * Removes all items in timeline section
   */
  async removeGroups(groups: TabGroups) {
    await this.tabService.removeTabGroups(groups);
  }
}
