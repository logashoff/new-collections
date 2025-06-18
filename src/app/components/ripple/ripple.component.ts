import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  signal,
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
    '[class.focused]': 'animate()',
  },
})
export class RippleComponent {
  readonly animate = signal<boolean>(false);
  readonly focused = input<boolean>(false);

  constructor() {
    const el = inject(ElementRef);
    const cdr = inject(ChangeDetectorRef);

    effect(async () => {
      if (this.focused()) {
        await sleep(225);
        await scrollIntoView(el.nativeElement);

        this.animate.set(true);
        cdr.markForCheck();
      } else {
        this.animate.set(false);
      }

      cdr.markForCheck();
    });
  }
}
