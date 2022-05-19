import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { TabService } from 'src/app/services';
import { BrowserTab, BrowserTabs } from 'src/app/utils';
import { RenameDialogComponent } from '../rename-dialog/rename-dialog.component';

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
  readonly trackByTabId = (_, tab: BrowserTab): number => tab.id;

  constructor(private tabService: TabService, private dialog: MatDialog) {}

  /**
   * Opens dialog to edit specified tab.
   */
  async editTab(tab: BrowserTab) {
    const dialogRef = this.dialog.open(RenameDialogComponent, { data: tab, disableClose: true });
    const update: Pick<BrowserTab, 'title' | 'url'> = await lastValueFrom(dialogRef.afterClosed());

    if (update && (tab.title !== update.title || tab.url !== update.url)) {
      tab.title = update.title;
      tab.url = update.url;

      this.tabService.save();
    }
  }

  /**
   * Removes specified tab from tab list.
   */
  async removeTab(removedTab: BrowserTab) {
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
