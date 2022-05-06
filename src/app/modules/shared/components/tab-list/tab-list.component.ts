import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { TabService } from 'src/app/services';
import { Tab } from 'src/app/utils';

@Component({
  selector: 'app-tab-list',
  templateUrl: './tab-list.component.html',
  styleUrls: ['./tab-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TabListComponent {
  @Input() tabs: Tab[];

  @Input() groupId: string;

  constructor(private tabService: TabService) {}

  async removeTab(tab: Tab) {
    this.tabService.removeTab(this.groupId, tab);
  }
}
