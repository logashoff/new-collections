import { ChangeDetectionStrategy, Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { NavService, TabService } from 'src/app/services';
import { TabGroup, TabGroups, TabsByHostname, trackByGroupId, trackByTabId } from 'src/app/utils';

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

  readonly tabsByHostname$: Observable<TabsByHostname> = this.tabService.tabsByHostname$;

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

  constructor(private navService: NavService, private tabService: TabService) {}

  favGroup(group: TabGroup) {
    this.tabService.favGroupToggle(group);
  }
}
