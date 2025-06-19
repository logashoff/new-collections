import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';

/**
 * @description
 *
 * Stretches to fit parent element and plays ripple animation when triggered
 */
@Component({
  selector: 'nc-ripple',
  template: '',
  styleUrl: './ripple.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.animated]': 'animate()',
  },
})
export class RippleComponent {
  readonly animate = input.required<boolean>();
}
