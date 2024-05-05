import { Directive, ElementRef, HostListener } from '@angular/core';

/**
 * @description
 *
 * Used for HTML elements that use `position: sticky`. Adds `.stuck` CSS class when element
 * is below threshold.
 */
@Directive({
  selector: '[appSticky]',
  standalone: true,
})
export class StickyDirective {
  #lastScrollTop = 0;
  #nativeElement: HTMLElement;

  @HostListener('body:scroll', ['$event'])
  private onScroll(event: Event) {
    const { scrollTop } = event.target as HTMLElement;
    const { classList } = this.#nativeElement;
    const scrollDiff = scrollTop - this.#lastScrollTop;
    const scrollUp = scrollDiff < 0;
    const rect = this.#nativeElement.getBoundingClientRect();

    classList.toggle('sticky', rect.y <= 0 && scrollTop > 0);
    classList.toggle('stuck', scrollUp);

    this.#lastScrollTop = scrollTop;
  }

  constructor(element: ElementRef) {
    this.#nativeElement = element.nativeElement as HTMLElement;
  }
}
