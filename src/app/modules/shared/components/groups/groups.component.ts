import { ChangeDetectionStrategy, Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { distinctUntilChanged, Observable, shareReplay, tap } from 'rxjs';
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
    tap(() => this.accordion?.closeAll()),
    shareReplay(1)
  );

  /**
   * Active tab ID from query params
   */
  readonly activeTabId$: Observable<number> = this.navService.paramsTabId$;

  /**
   * List of tab groups to render.
   */
  @Input() groups: TabGroups;

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
