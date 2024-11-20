import { ChangeDetectionStrategy, Component, HostBinding, input, output, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TranslatePipe } from '../../pipes';
import { TimelineLabelComponent } from '../timeline-label/timeline-label.component';

/**
 * @description
 *
 * Component for rendering timeline elements
 */
@Component({
  selector: 'nc-timeline-element',
  templateUrl: './timeline-element.component.html',
  styleUrl: './timeline-element.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, TimelineLabelComponent, TranslatePipe],
})
export class TimelineElementComponent {
  /**
   * Header label
   */
  readonly timelineLabel = input<string>();

  /**
   * Display controls
   */
  readonly controls = input<boolean>(true);

  /**
   * Emits event when remove button clicked
   */
  readonly removed = output();

  /**
   * True when any child panels are expanded
   */
  readonly expanded = input<boolean>(false);

  @HostBinding('class.expanded')
  get isExpanded() {
    return this.expanded();
  }

  /**
   * Handles remove button
   */
  remove() {
    this.removed.emit();
  }
}
