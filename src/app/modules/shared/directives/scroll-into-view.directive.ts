import { Directive, ElementRef, Input } from '@angular/core';
import isNil from 'lodash/isNil';

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

    if (!isNil(this.tabId)) {
      this.scroll();
    }
  }

  /**
   * Targets expansion panel header by group ID
   */
  @Input() set appScrollIntoView(value: boolean) {
    this.shouldScroll = value;

    this.scroll();
  }

  constructor(private el: ElementRef) {}

  private scroll() {
    if (this.shouldScroll) {
      clearTimeout(this.timeoutId);

      // delay to wait for panel animation to complete
      this.timeoutId = setTimeout(() => {
        const vh = window.innerHeight;
        const el: HTMLElement = this.el.nativeElement;
        const { height } = el.getBoundingClientRect();
        const child = el.querySelector(`[data-tab-id="${this.tabId}"]`);

        // if panel height is bigger than viewport height, scroll to child tan instead
        if (height > vh && child) {
          child.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        } else {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }, 450);
    }
  }
}
