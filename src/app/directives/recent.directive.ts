import { Directive, ElementRef, HostListener, input } from '@angular/core';
import { BackgroundService, NavService } from '../services';
import { addRecent, Tab } from '../utils';
/**
 * @description
 *
 * Save tab ID to storage when tab is clicked
 */
@Directive({ selector: '[recent]' })
export class RecentDirective {
  readonly recent = input.required<Tab>();

  @HostListener('auxclick', ['$event'])
  @HostListener('click', ['$event'])
  private async eventHandler(event: PointerEvent) {
    const tab = this.recent();

    if (tab) {
      const { url: tabUrl, id: tabId } = tab;

      try {
        this.bgService.sendMessage({
          tabUrl,
          tabId,
        });
      } catch (error) {
        console.warn(error);

        const { isPopup } = this.navService;

        if (isPopup) {
          event.preventDefault();
        }

        await addRecent(tabId);

        if (isPopup) {
          this.el.nativeElement.dispatchEvent(new MouseEvent('click', { ...event }));
        }
      }
    }
  }

  constructor(
    private readonly bgService: BackgroundService,
    private readonly el: ElementRef,
    private readonly navService: NavService
  ) {}
}
