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
   * Set tab ID in case panel height is too big to scroll to child tab instead
   */
  @Input() set appScrollIntoViewTabId(value: number) {
    this.tabId = value;
  }

  /**
   * Targets expansion panel header by group ID
   */
  @Input() set appScrollIntoView(value: boolean) {
    if (value) {
      // delay to wait for panel animation to complete
      setTimeout(() => {
        const vh = window.innerHeight;
        const el: HTMLElement = this.el.nativeElement;
        const rect = el.getBoundingClientRect();
        const { height } = rect;

        // if panel height is bigger than viewport height, scroll to child tan instead
        if (height > vh) {
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

  constructor(private el: ElementRef) {}
}
