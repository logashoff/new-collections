import { Directive, HostListener, inject, OnDestroy } from '@angular/core';

import { ListItemComponent } from '../components';
import { KeyService } from '../services';

@Directive()
export class KeyListenerDirective implements OnDestroy {
  private keyService = inject(KeyService<ListItemComponent>);

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    this.keyService.keyDown(event);
  }

  clearActive() {
    this.keyService.clear();
  }

  ngOnDestroy() {
    this.keyService.destroy();
    this.keyService = null;
  }
}
