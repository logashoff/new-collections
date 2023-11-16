import { AfterViewInit, Directive, ElementRef, OnDestroy } from '@angular/core';

/**
 * @deprecated
 * 
 * Used for HTML elements that use `position: sticky`. Adds `.stuck` CSS class when element
 * is below threshold.
 */
@Directive({
  selector: '[appSticky]',
})
export class StickyDirective implements OnDestroy, AfterViewInit {
  private intersectionObservable: IntersectionObserver = new IntersectionObserver(
    ([entry]) => entry.target.classList.toggle('stuck', entry.intersectionRatio < 1),
    {
      threshold: [1],
    }
  );

  constructor(private element: ElementRef) {}

  ngAfterViewInit() {
    this.intersectionObservable.observe(this.element.nativeElement);
  }

  ngOnDestroy() {
    this.intersectionObservable.disconnect();
  }
}
