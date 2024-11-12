import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'nc-timeline-label',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline-label.component.html',
  styleUrl: './timeline-label.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TimelineLabelComponent {}
