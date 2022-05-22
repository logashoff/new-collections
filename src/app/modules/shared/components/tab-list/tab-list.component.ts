import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { TabService } from 'src/app/services';
import { BrowserTab, BrowserTabs } from 'src/app/utils';

/**
 * @description
 *
 * Tabs list component
 */
@Component({
  selector: 'app-tab-list',
  templateUrl: './tab-list.component.html',
  styleUrls: ['./tab-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TabListComponent {
  /**
   * Tabs list to display
   */
  @Input() tabs: BrowserTabs;

  /**
   * Emits event when list item is clicked.
   */
  @Output() readonly itemClicked = new EventEmitter<BrowserTab>();

  /**
   * Tab list *ngFor trackBy function
   */
  readonly trackByTabId = (_, tab: BrowserTab): string => `${tab.id}+${tab.url}`;

  constructor(private tabService: TabService) {}

  async editTab(tab: BrowserTab) {
    const updatedTab = await this.tabService.updateTab(tab);

    if (updatedTab && !this.tabs.includes(updatedTab)) {
      const index = this.tabs.findIndex((t) => t.id === updatedTab.id);

      if (index > -1) {
        this.tabs.splice(index, 1, updatedTab);
      }
    }
  }

  /**
   * Removes specified tab from tab list.
   */
  async deleteTab(removedTab: BrowserTab) {
    const messageRef = await this.tabService.removeTab(removedTab);

    let index = this.tabs.findIndex((tab) => tab === removedTab);
    if (messageRef && index > -1) {
      this.tabs.splice(index, 1);

      const { dismissedByAction: revert } = await lastValueFrom(messageRef.afterDismissed());

      if (revert) {
        this.tabs.splice(index, 0, removedTab);
      }
    }
  }

  /**
   * Handles list item click and dispatches event.
   */
  handleItemClick(tab: BrowserTab) {
    this.itemClicked.emit(tab);
  }
}
