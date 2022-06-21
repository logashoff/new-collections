import { Component, EventEmitter, Input, Output } from '@angular/core';
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

  /**
   * Indicates pinned expansion panel
   */
  @Input() pinned = false;

  /**
   * Emits event when star button is clicked
   */
  @Output() readonly starred = new EventEmitter();

  /**
   * Disables edit buttons
   */
  @Input() readOnly = false;

  favClicked() {
    this.starred.emit();
  }
}
