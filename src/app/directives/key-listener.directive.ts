import { Directive, inject, OnDestroy } from '@angular/core';

import { ListItemComponent } from '../components';
import { KeyService } from '../services';

/**
 * @description
 *
 * Helper component to manage key events for list items
 */
@Directive({
  host: {
    '(keydown)': 'onKeydown($event)',
  },
})
export class KeyListenerDirective implements OnDestroy {
  private keyService = inject(KeyService<ListItemComponent>);

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
