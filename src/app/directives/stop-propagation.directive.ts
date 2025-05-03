import { Directive } from '@angular/core';

/**
 * @description
 *
 * Prevents event propagation on clicked element.
 */
@Directive({
  selector: '[stopPropagation]',
  host: {
    '(click)': 'onClick($event)',
  },
})
export class StopPropagationDirective {
  onClick(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
  }
}
