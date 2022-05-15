import { Directive, ElementRef, Input } from '@angular/core';

/**
 * @description
 *
 * Scrolls target element into view.
 */
@Directive({
  selector: '[appScrollIntoView]',
})
export class ScrollIntoViewDirective {
  @Input() set appScrollIntoView(value: boolean) {
    if (value) {
      // delay to wait for panel animation to complete
      setTimeout(() => this.el.nativeElement.scrollIntoView({ behavior: 'smooth' }), 450);
    }
  }

  constructor(private el: ElementRef) {}
}
