import { Directive, ElementRef, HostListener, input } from '@angular/core';
import { NavService } from '../services';
import { addRecent, TabId } from '../utils';

/**
 * @description
 *
 * Save tab ID to storage when tab is clicked
 */
@Directive({ selector: '[recent]' })
export class RecentDirective {
  readonly recent = input.required<TabId>();

  @HostListener('auxclick', ['$event'])
  @HostListener('click', ['$event'])
  private async eventHandler(e: PointerEvent) {
    const recent = this.recent();
    if (recent) {
      const { isPopup } = this.navService;

      if (isPopup) {
        e.preventDefault();
      }

      await addRecent(recent);

      if (isPopup) {
        this.el.nativeElement.dispatchEvent(new MouseEvent('click', { ...e }));
      }
    }
  }

  constructor(
    private readonly el: ElementRef,
    private readonly navService: NavService
  ) {}
}
