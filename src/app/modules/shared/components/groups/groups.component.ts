import { ChangeDetectionStrategy, Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { NavService } from 'src/app/services';
import { BrowserTab, TabGroups, trackByGroupId, trackByTabId } from 'src/app/utils';

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
  readonly activeGroupId$: Observable<string> = this.navService.paramsGroupId$.pipe(shareReplay(1));

  /**
   * Active tab ID from query params
   */
  readonly activeTabId$: Observable<number> = this.navService.paramsTabId$.pipe(shareReplay(1));

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
  readonly trackByGroupId = trackByGroupId;
  readonly trackByTabId = trackByTabId;

  /**
   * Handles list item click event and opens new browser tab with tab URL
   */
  handleItemClick(tab: BrowserTab) {
    window.open(tab.url, '_blank');
  }

  constructor(private navService: NavService) {}
}
