import { Directive, HostListener, input } from '@angular/core';
import { addRecent, TabId } from '../utils';

/**
 * @description
 *
 * Save tab ID to storage when tab is clicked
 */
@Directive({
  selector: '[recent]',
  standalone: true,
})
export class RecentDirective {
  readonly recent = input.required<TabId>();

  @HostListener('auxclick', ['$event'])
  @HostListener('click', ['$event'])
  private async eventHandler() {
    const recent = this.recent();
    if (recent) {
      await addRecent(recent);
    }
  }
}
