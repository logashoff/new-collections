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
  /**
   * Store tab ID
   */
  private tabId: number;

  /**
   * Scroll timeout gets cleared before scrolling again.
   */
  private timeoutId: any;

  /**
   * Indicates scroll function should trigger scrolling.
   */
  private shouldScroll = false;

  /**
   * Set tab ID in case panel height is too big to scroll to child tab instead
   */
  @Input() set appScrollIntoViewTabId(value: number) {
    this.tabId = value;
    this.scroll();
  }

  /**
   * Targets expansion panel header by group ID
   */
  @Input() set appScrollIntoView(value: boolean) {
    this.shouldScroll = value;
  }

  constructor(private el: ElementRef) {}

  private scroll() {
    if (this.shouldScroll) {
      clearTimeout(this.timeoutId);

      // delay to wait for panel animation to complete
      this.timeoutId = setTimeout(() => {
        const vh = window.innerHeight;
        const el: HTMLElement = this.el.nativeElement;
        const rect = el.getBoundingClientRect();
        const { height } = rect;

        // if panel height is bigger than viewport height, scroll to child tan instead
        if (height > vh && this.tabId) {
          const child = el.querySelector(`[tabId="${this.tabId}"]`);
          child.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        } else {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 450);
    }
  }
}
