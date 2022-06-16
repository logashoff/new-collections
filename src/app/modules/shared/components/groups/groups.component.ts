import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, map, Observable, shareReplay } from 'rxjs';
import { NavService, SettingsService, TabService } from 'src/app/services';
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
   * Expand and collapse panels based on query params groupId
   */
  readonly activeGroupId$: Observable<string> = this.navService.paramsGroupId$;

  /**
   * Active tab ID from query params
   */
  readonly activeTabId$: Observable<number> = this.navService.paramsTabId$;

  private readonly groups$ = new BehaviorSubject<TabGroups>(null);

  readonly tabsByHostname$: Observable<TabsByHostname> = this.groups$.pipe(
    map((tabGroups) => (tabGroups?.length > 0 ? this.tabService.createHostnameGroups(tabGroups) : null)),
    shareReplay(1)
  );

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
   * Hashmap of expanded panel states by group ID
   */
  readonly panelStates$ = this.settings.panelStates$.pipe(map((states) => states ?? {}));

  /**
   * Group list ngFor trackBy function.
   */
  readonly trackByGroupId = trackByGroupId;
  readonly trackByTabId = trackByTabId;
  readonly isNaN = isNaN;

  constructor(private navService: NavService, private tabService: TabService, private settings: SettingsService) {}

  favGroup(group: TabGroup) {
    this.tabService.favGroupToggle(group);
  }

  hasTabGroup(group: TabGroup): boolean {
    return this.tabService.hasTabGroup(group);
  }

  opened(groupId: string) {
    this.settings.savePanelState(groupId, true);
  }

  closed(groupId: string) {
    this.settings.savePanelState(groupId, false);
  }
}
