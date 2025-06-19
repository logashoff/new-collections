import { Directive, effect, ElementRef, inject, input } from '@angular/core';
import { scrollIntoView, sleep } from '../utils';

@Directive({
  selector: '[scrollIntoView]',
})
export class ScrollIntoViewDirective {

  readonly scrollIntoView = input.required<boolean>();

  constructor() {
    const el = inject(ElementRef);

    effect(async () => {
      if (this.scrollIntoView()) {
        await sleep(225);
        await scrollIntoView(el.nativeElement);
      }
    });
  }
}
