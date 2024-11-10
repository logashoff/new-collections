import { Directive, HostListener } from '@angular/core';
import { rankUrl } from '../utils';

/**
 * @description
 *
 * Ranks links based on number of list items clicks
 */
@Directive({
  selector: 'a[href][appRankUrl]',
  standalone: true,
})
export class RankUrlDirective {
  @HostListener('auxclick', ['$event'])
  @HostListener('click', ['$event'])
  private async eventHandler(e: PointerEvent) {
    const target = e.currentTarget as HTMLAnchorElement;
    const url = target.href;
    await rankUrl(url);
  }
}
