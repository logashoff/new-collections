import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timeline-label',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline-label.component.html',
  styleUrl: './timeline-label.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineLabelComponent {

}
