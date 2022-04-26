import { ChangeDetectionStrategy, Component, Input, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { restoreTabs, TabGroup } from '@lib';
import { TabService } from 'src/app/services';

/**
 * @description
 *
 * Displays list of tab groups.
 */
@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class GroupsComponent {
  /**
   * List of tab groups to render.
   */
  @Input() groups: TabGroup[];

  /**
   * Expansion panel list that are part of the DOM.
   */
  @ViewChildren(MatExpansionPanel) private panelList: QueryList<MatExpansionPanel>;

  /**
   * Returns index of expanded panel.
   * ℹ️ This will be used to display controls for each panel.
   * 🤔 TODO: Find more optimized way to show controls without loops or panel list.
   */
  get currentPanelIndex(): number {
    if (this.panelList) {
      const panels = this.panelList.toArray();
      for (let i = 0; i < panels.length; i++) {
        if (panels[i].expanded) {
          return i;
        }
      }
    }

    return -1;
  }


  constructor(private tabService: TabService) {}

  /**
   * Removes `group` from tab group list and storage.
   */
  removeTabs(group: TabGroup) {
    this.tabService.removeTabGroup(group);
  }

  /**
   * Opens all tabs from `group` object.
   */
  restoreTabs(group: TabGroup) {
    restoreTabs(group);
  }
}
