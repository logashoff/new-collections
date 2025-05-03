import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  input,
  ViewEncapsulation,
} from '@angular/core';

import { scrollIntoView, sleep } from '../../utils';

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
    '[class.focused]': 'animate',
  },
})
export class RippleComponent {
  readonly focused = input<boolean>(false);

  animate = false;

  constructor(el: ElementRef, cdr: ChangeDetectorRef) {
    effect(async () => {
      if (this.focused()) {
        await sleep(225);
        await scrollIntoView(el.nativeElement);

        this.animate = true;
        cdr.markForCheck();

        await sleep(1_000);

        this.animate = false;
      } else {
        this.animate = false;
      }

      cdr.markForCheck();
    });
  }
}
