import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { BehaviorSubject, Observable, map, shareReplay } from 'rxjs';
import { IsReadOnlyGroupPipe } from '../../pipes/index';
import { NavService, SettingsService, TabService } from '../../services/index';
import {
  BrowserTab,
  BrowserTabs,
  GroupExpanded,
  TabGroup,
  TabGroups,
  TabsByHostname,
  listItemAnimation,
} from '../../utils/index';
import { GroupControlsComponent } from '../group-controls/group-controls.component';
import { ListItemComponent } from '../list-item/list-item.component';
import { PanelHeaderComponent } from '../panel-header/panel-header.component';
import { RippleComponent } from '../ripple/ripple.component';

/**
 * @description
 *
 * Displays list of tab groups.
 */
@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  animations: [listItemAnimation],
  imports: [
    CommonModule,
    DragDropModule,
    GroupControlsComponent,
    IsReadOnlyGroupPipe,
    ListItemComponent,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    PanelHeaderComponent,
    RippleComponent,
  ],
})
export class GroupsComponent {
  /**
   * Expand and collapse panels based on query params groupId
   */
  readonly activeGroupId$: Observable<string>;

  /**
   * Active tab ID from query params
   */
  readonly activeTabId$: Observable<number>;

  private readonly groups$ = new BehaviorSubject<TabGroups>(null);

  readonly tabsByHostname$: Observable<TabsByHostname> = this.groups$.pipe(
    map((tabGroups) => (tabGroups?.length > 0 ? this.tabService.createHostnameGroups(tabGroups) : null)),
    shareReplay(1)
  );

  /**
   * Maps group ID to list of group's tab titles
   */
  readonly titlesMap$: Observable<{ [groupId: string]: string }> = this.groups$.pipe(
    map((tabGroups) =>
      tabGroups.reduce((ret, group) => {
        ret[group.id] = group.tabs.map((tab) => tab.title);
        return ret;
      }, {})
    ),
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
   * Disable list items drag and drop
   */
  @Input() dragDisabled = true;

  /**
   * Hashmap of expanded panel states by group ID
   */
  readonly panelStates$: Observable<GroupExpanded>;

  readonly isNaN = isNaN;

  readonly openTabs$ = this.tabService.openTabChanges$.pipe(shareReplay(1));
  readonly timelineTabs$ = this.tabService.tabs$.pipe(shareReplay(1));
  readonly isPopup = this.navService.isPopup;

  constructor(
    private readonly navService: NavService,
    private readonly tabService: TabService,
    private readonly settings: SettingsService
  ) {
    this.panelStates$ = this.settings.panelStates$.pipe(map((states) => states ?? {}));
    this.activeGroupId$ = this.navService.paramsGroupId$;
    this.activeTabId$ = this.navService.paramsTabId$;
  }

  favGroup(group: TabGroup) {
    this.tabService.favGroupToggle(group);
  }

  /**
   * Saves open panel state to local storage
   */
  opened(groupId: string) {
    this.settings.savePanelState(groupId, true);
  }

  /**
   * Removes open panel state from storage
   */
  closed(groupId: string) {
    this.settings.savePanelState(groupId, false);
  }

  /**
   * Handles tab group drag and drop event
   */
  drop(event: CdkDragDrop<BrowserTabs>, tabs: BrowserTabs) {
    moveItemInArray(tabs, event.previousIndex, event.currentIndex);
    this.tabService.save();
  }

  async editTab(tab: BrowserTab) {
    await this.tabService.updateTab(tab);
  }

  async deleteTab(tab: BrowserTab) {
    await this.tabService.removeTab(tab);
  }
}
