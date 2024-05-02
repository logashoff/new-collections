import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { flatMap } from 'lodash-es';
import { Observable, map, shareReplay } from 'rxjs';
import { HomeService, TabService } from 'src/app/services';
import { Action, ActionIcon, BrowserTabs, CollectionActions, TabGroups, Timeline, TopSites } from 'src/app/utils';
import {
  EmptyComponent,
  GroupsComponent,
  SearchComponent,
  SearchFormComponent,
  StickyDirective,
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
    SearchFormComponent,
    StickyDirective,
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

  constructor(
    private homeService: HomeService,
    private tabService: TabService
  ) {
    this.devicesTimeline$ = homeService.devicesTimeline$;
    this.hasAnyData$ = homeService.hasAnyData$;
    this.searchSource$ = tabService.tabs$;
    this.devices$ = homeService.devices$.pipe(
      map((devices) => flatMap(devices?.map((device) => homeService.getTabsFromSessions(device.sessions)))),
      shareReplay(1)
    );
    this.timeline$ = homeService.timeline$;
    this.topSites$ = homeService.topSites$.pipe(shareReplay(1));
  }

  /**`
   * Removes all items in timeline section
   */
  async removeGroups(groups: TabGroups) {
    await this.tabService.removeTabGroups(groups);
  }
}
