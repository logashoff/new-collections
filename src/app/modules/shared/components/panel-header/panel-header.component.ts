import { Component, Input } from '@angular/core';
import { HostnameGroup } from 'src/app/utils';

/**
 * Expansion panel header layout container.
 */
@Component({
  selector: 'app-panel-header',
  templateUrl: './panel-header.component.html',
  styleUrls: ['./panel-header.component.scss'],
})
export class PanelHeaderComponent {
  /**
   * Icons list.
   */
  @Input() icons: HostnameGroup;

  /**
   * Total number of items in the list
   */
  @Input() total: number;
}
