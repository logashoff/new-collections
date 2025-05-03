import { Directive, ElementRef, inject, input } from '@angular/core';
import { BackgroundService, NavService } from '../services';
import { addRecent, Tab } from '../utils';
/**
 * @description
 *
 * Save tab ID to storage when tab is clicked
 */
@Directive({
  selector: '[recent]',
  host: {
    '(auxclick)': 'eventHandler($event)',
    '(click)': 'eventHandler($event)',
  },
})
export class RecentDirective {
  readonly #bgService = inject(BackgroundService);
  readonly #el = inject(ElementRef);
  readonly #navService = inject(NavService);

  readonly recent = input.required<Tab>();

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

        const { isPopup } = this.#navService;

        if (isPopup) {
          event.preventDefault();
        }

        await addRecent(tabId);

        if (isPopup) {
          this.#el.nativeElement.dispatchEvent(new MouseEvent('click', { ...event }));
        }
      }
    }
  }
}
