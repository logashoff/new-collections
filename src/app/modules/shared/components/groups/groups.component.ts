import { ChangeDetectionStrategy, Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { isNil } from 'lodash';
import { BehaviorSubject, distinctUntilChanged, filter, map, Observable, shareReplay, switchMap, tap } from 'rxjs';
import { NavService } from 'src/app/services';
import { BrowserTab, TabGroup, TabGroups } from 'src/app/utils';

/**
 * @description
 *
 * Displays list of tab groups.
 */
@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupsComponent {
  /**
   * MatAccordion ref
   */
  @ViewChild(MatAccordion) accordion: MatAccordion;

  /**
   * Expand and collapse panels based on query params groupId
   */
  readonly activeGroupId$: Observable<string> = this.navService.paramsGroupId$.pipe(
    distinctUntilChanged(),
    filter((activeGroupId) => !isNil(activeGroupId)),
    switchMap((activeGroupId) =>
      this.groups$.pipe(
        map((groups) => groups.some(({ id }) => id === activeGroupId)),
        tap((hasGroups) => {
          if (!hasGroups) {
            this.accordion?.closeAll();
          }
        }),
        map(() => activeGroupId)
      )
    ),
    shareReplay(1)
  );

  /**
   * Active tab ID from query params
   */
  readonly activeTabId$: Observable<number> = this.navService.paramsTabId$.pipe(distinctUntilChanged(), shareReplay(1));

  private readonly groups$ = new BehaviorSubject<TabGroups>(null);

  /**
   * List of tab groups to render.
   */
  @Input() set groups(value: TabGroups) {
    this.groups$.next(value);
  }

  get groups(): TabGroups {
    return this.groups$.value;
  }

  /**
   * Group list ngFor trackBy function.
   */
  readonly trackByGroupId = (_, group: TabGroup): string => group.id;

  /**
   * Handles list item click event and opens new browser tab with tab URL
   */
  handleListClick(tab: BrowserTab) {
    window.open(tab.url, '_blank');
  }

  constructor(private navService: NavService) {}
}
