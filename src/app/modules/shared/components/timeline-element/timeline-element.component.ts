import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

/**
 * @description
 *
 * Component for rendering timeline elements
 */
@Component({
  selector: 'app-timeline-element',
  templateUrl: './timeline-element.component.html',
  styleUrls: ['./timeline-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
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
