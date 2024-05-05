import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { HostnameGroup } from '../../utils/index';

import { StopPropagationDirective } from '../../directives/index';
import { IconsContainerComponent } from '../icons-container/icons-container.component';

/**
 * Expansion panel header layout container.
 */
@Component({
  selector: 'app-panel-header',
  templateUrl: './panel-header.component.html',
  styleUrl: './panel-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    IconsContainerComponent,
    MatIconModule,
    MatTooltipModule,
    StopPropagationDirective,
    TranslateModule,
  ],
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

  /**
   * Optional text to display
   */
  @Input() titleText: string[];

  favClicked() {
    this.starred.emit();
  }
}
