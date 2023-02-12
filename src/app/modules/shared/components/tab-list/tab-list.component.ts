import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ViewEncapsulation } from '@angular/core';
import { BrowserTabs } from 'src/app/utils';

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

  drop(event: CdkDragDrop<BrowserTabs>) {
    moveItemInArray(tabs, event.previousIndex, event.currentIndex);
  }
}
