import { Directive, HostListener } from '@angular/core';

/**
 * @description
 *
 * Prevents event propagation on clicked element.
 */
@Directive({
  selector: '[appStopPropagation]',
  standalone: true,
})
export class StopPropagationDirective {
  @HostListener('click', ['$event']) onClick(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
  }
}
