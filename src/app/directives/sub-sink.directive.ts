import { Directive, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

/**
 * @description
 *
 * Helper component to clean up subscriptions when component is destroyed
 */
@Directive()
export class SubSinkDirective implements OnDestroy {
  private subs: Subscription[] = [];

  protected subscribe(...subscriptions: Subscription[]) {
    this.subs = this.subs.concat(subscriptions);
  }

  ngOnDestroy() {
    this.subs.forEach((sub) => sub?.unsubscribe());
    this.subs = [];
  }
}
