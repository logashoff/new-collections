import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  HostBinding,
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
})
export class RippleComponent {
  readonly focused = input<boolean>(false);

  @HostBinding('class.focused')
  private _focused = false;

  constructor(el: ElementRef, cdr: ChangeDetectorRef) {
    effect(async () => {
      if (this.focused()) {
        await sleep(225);
        await scrollIntoView(el.nativeElement);

        this._focused = true;
        cdr.markForCheck();

        await sleep(1000);

        this._focused = false;
      } else {
        this._focused = false;
      }

      cdr.markForCheck();
    });
  }
}
