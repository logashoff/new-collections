import { ChangeDetectionStrategy, Component, input, output, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TimelineLabelComponent } from '../timeline-label/timeline-label.component';
import { translate } from '../../utils';

/**
 * @description
 *
 * Component for rendering timeline elements
 */
@Component({
  selector: 'app-timeline-element',
  templateUrl: './timeline-element.component.html',
  styleUrl: './timeline-element.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, TimelineLabelComponent],
})
export class TimelineElementComponent {
  readonly translate = translate;

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
   * Handles remove button
   */
  remove() {
    this.removed.emit();
  }
}
