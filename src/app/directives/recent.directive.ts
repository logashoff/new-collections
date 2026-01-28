import { Directive, ElementRef, inject, input } from '@angular/core';
import { BackgroundService } from '../services';
import { addRecent, BrowserTab, IS_POPUP } from '../utils';

/**
 * @description
 *
 * Save tab ID to storage when tab is clicked
 */
@Directive({
  selector: '[recent]',
  host: {
    '(auxclick)': 'void eventHandler($event)',
    '(click)': 'void eventHandler($event)',
  },
})
export class RecentDirective {
  readonly #bgService = inject(BackgroundService);
  readonly #el = inject(ElementRef);
  readonly #isPopup = inject(IS_POPUP);

  readonly recent = input.required<BrowserTab>();

  async eventHandler(event: PointerEvent) {
    const tab = this.recent();

    if (tab) {
      const { url: tabUrl, id: tabId } = tab;

      try {
        this.#bgService.sendMessage({
          tabUrl,
          tabId,
        });
      } catch (error) {
        console.warn(error);

        if (this.#isPopup) {
          event.preventDefault();
        }

        await addRecent(tabId);

        if (this.#isPopup) {
          this.#el.nativeElement.dispatchEvent(new MouseEvent('click', { ...event }));
        }
      }
    }
  }
}
