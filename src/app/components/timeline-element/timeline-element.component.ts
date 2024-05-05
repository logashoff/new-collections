import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { TimelineLabelComponent } from '../timeline-label/timeline-label.component';

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
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, TimelineLabelComponent, TranslateModule],
})
export class TimelineElementComponent {
  /**
   * Header label
   */
  @Input() timelineLabel: string;

  /**
   * Display controls
   */
  @Input() controls = true;

  /**
   * Emits event when remove button clicked
   */
  @Output() readonly removed = new EventEmitter();

  /**
   * Handles remove button
   */
  remove() {
    this.removed.emit();
  }
}
