import { Directive, HostListener, inject, OnDestroy } from '@angular/core';

import { ListItemComponent } from '../components';
import { KeyService } from '../services';
import { KEY_DOWN } from '../utils';

/**
 * @description
 *
 * Helper component to manage key events for list items
 */
@Directive()
export class KeyListenerDirective implements OnDestroy {
  private keyService = inject(KeyService<ListItemComponent>);

  @HostListener(KEY_DOWN, ['$event'])
  protected onKeydown(event: KeyboardEvent) {
    this.keyService.keyDown(event);
  }

  protected clearActive() {
    this.keyService.clear();
  }

  ngOnDestroy() {
    this.keyService.destroy();
    this.keyService = null;
  }
}
