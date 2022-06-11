import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TabGroups } from 'src/app/utils';

@Component({
  selector: 'app-timeline-element',
  templateUrl: './timeline-element.component.html',
  styleUrls: ['./timeline-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineElementComponent {
  @Input() timelineLabel: string;

  @Input() timelineGroups: TabGroups;

  @Output() readonly removed = new EventEmitter<TabGroups>();

  remove() {
    this.removed.emit(this.timelineGroups);
  }
}
