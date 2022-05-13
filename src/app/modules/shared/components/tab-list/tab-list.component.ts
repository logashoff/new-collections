import { ChangeDetectorRef, Component, Input, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { remove } from 'lodash';
import { lastValueFrom } from 'rxjs';
import { TabService } from 'src/app/services';
import { BrowserTab } from 'src/app/utils';
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
  @Input() tabs: BrowserTab[];

  constructor(private tabService: TabService, private dialog: MatDialog, private cdr: ChangeDetectorRef) {}

  /**
   * Opens dialog to edit specified tab.
   */
  async editTab(tab: BrowserTab) {
    const dialogRef = this.dialog.open(RenameDialogComponent, { data: tab, disableClose: true });
    const update: Pick<BrowserTab, 'title' | 'url'> = await lastValueFrom(dialogRef.afterClosed());

    if (update && (tab.title !== update.title || tab.url !== update.url)) {
      tab.title = update.title;
      tab.url = update.url;

      this.tabService.saveTabs();
      this.cdr.markForCheck();
    }
  }

  /**
   * Removes specified tab from tab list.
   */
  async removeTab(tab: BrowserTab) {
    const tabRemoved = await this.tabService.removeTab(tab);

    if (tabRemoved) {
      remove(this.tabs, (t) => t === tab);
    }
  }

  readonly trackByTabId = (_, tab: BrowserTab): number => tab.id;
}
