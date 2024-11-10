import { ActiveDescendantKeyManager, Highlightable } from '@angular/cdk/a11y';
import { DOWN_ARROW, ENTER, UP_ARROW } from '@angular/cdk/keycodes';
import { Injectable, QueryList } from '@angular/core';

export interface Activatable extends Highlightable {
  activate?(): void;
}

/**
 * @description
 *
 * Helper service for `KeyListenerDirective`
 */
@Injectable()
export class KeyService<T extends Activatable> {
  private keyManager: ActiveDescendantKeyManager<T>;

  keyDown(event: KeyboardEvent) {
    event.stopImmediatePropagation();

    if (event.keyCode === DOWN_ARROW || event.keyCode === UP_ARROW) {
      this.keyManager?.onKeydown(event);
    } else if (event.keyCode === ENTER) {
      this.keyManager?.activeItem?.activate();
    }
  }

  setItems(items: QueryList<T>) {
    this.keyManager = new ActiveDescendantKeyManager(items).withWrap();
  }

  setActive(index: number) {
    this.keyManager?.setActiveItem(index);
  }

  clear() {
    this.keyManager?.setActiveItem(-1);
  }

  destroy() {
    this.keyManager?.destroy();
  }
}