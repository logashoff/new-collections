import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { flatMap, isNil } from 'lodash-es';
import { Observable, combineLatest, map, shareReplay } from 'rxjs';

import { TranslatePipe } from '../../pipes';
import { HomeService, NavService, TabService } from '../../services';
import { Action, ActionIcon, Actions, CollectionActions, TabGroups, Timeline, translate } from '../../utils';
import { EmptyComponent } from '../empty/empty.component';
import { GroupsComponent } from '../groups/groups.component';
import { SearchFormComponent } from '../search-form/search-form.component';
import { TimelineElementComponent } from '../timeline-element/timeline-element.component';
import { TopSitesComponent } from '../top-sites/top-sites.component';

/**
 * @description
 *
 * New Tab root component.
 */
@Component({
  selector: 'nc-new-tab',
  templateUrl: './new-tab.component.html',
  styleUrls: ['./new-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    AsyncPipe,
    EmptyComponent,
    GroupsComponent,
    SearchFormComponent,
    TimelineElementComponent,
    TopSitesComponent,
    TranslatePipe,
  ],
})
export class NewTabComponent implements OnInit {
  readonly tabActions: Actions = [Action.Edit, Action.Delete];

  readonly noDataActions: CollectionActions = [
    {
      action: Action.Import,
      icon: ActionIcon.Import,
      label: translate('importCollections'),
      color: 'primary',
    },
  ];

  readonly urlChanges$ = this.navService.pathChanges$;
  readonly topSites$ = this.homeService.topSites$;
  readonly hasData$ = this.homeService.hasAnyData$;
  readonly searchSource$ = this.tabService.tabs$;
  readonly devices$ = this.homeService.devices$.pipe(
    map((devices) => flatMap(devices?.map((device) => this.homeService.getTabsFromSessions(device.sessions)))),
    shareReplay(1)
  );
  readonly devicesTimeline$: Observable<Timeline> = this.homeService.devicesTimeline$;
  readonly hasAnyData$: Observable<boolean> = this.homeService.hasAnyData$;
  readonly timeline$: Observable<Timeline> = this.homeService.timeline$;

  /**
   * Check if search is active
   */
  readonly isSearchActive$ = this.navService.pathChanges$.pipe(
    map(() => this.navService.isActive('search')),
    shareReplay(1)
  );

  /**
   * Hide top sites component when search is active
   */
  hideTopSites$: Observable<boolean>;

  constructor(
    private readonly homeService: HomeService,
    private readonly navService: NavService,
    private readonly tabService: TabService
  ) {}

  ngOnInit() {
    this.hideTopSites$ = combineLatest([this.topSites$, this.isSearchActive$]).pipe(
      map(([topSites, isSearchActive]) => isNil(topSites) || topSites?.length === 0 || isSearchActive),
      shareReplay(1)
    );
  }

  /**`
   * Removes all items in timeline section
   */
  async removeGroups(groups: TabGroups) {
    await this.tabService.removeTabGroups(groups);
  }
}
