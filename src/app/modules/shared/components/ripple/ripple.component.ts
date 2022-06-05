import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

/**
 * @description
 * 
 * Stretches to fit parent element and plays ripple animation when triggered
 */
@Component({
  selector: 'app-ripple',
  templateUrl: './ripple.component.html',
  styleUrls: ['./ripple.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RippleComponent {
  /**
   * Triggers animation when true
   */
  @Input() focused = false;
}
