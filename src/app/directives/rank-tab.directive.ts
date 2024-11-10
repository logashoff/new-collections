import { Directive, HostListener, Input } from '@angular/core';
import { rankTab, TabId } from '../utils';

@Directive({
  selector: '[rankTab]',
  standalone: true,
})
export class RankTabDirective {
  @Input() rankTab: TabId;

  @HostListener('auxclick', ['$event'])
  @HostListener('click', ['$event'])
  private async eventHandler() {
    if (this.rankTab) {
      await rankTab(this.rankTab);
    }
  }
}
