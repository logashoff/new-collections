import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, from, map, Observable, of, switchMap, timer } from 'rxjs';
import { scrollIntoView } from 'src/app/utils';

/**
 * @description
 *
 * Stretches to fit parent element and plays ripple animation when triggered
 */
@Component({
  selector: 'app-ripple',
  templateUrl: './ripple.component.html',
  styleUrls: ['./ripple.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RippleComponent {
  private readonly focused$ = new BehaviorSubject<boolean>(false);

  /**
   * Triggers animation when true
   */
  @Input() set focused(value: boolean) {
    this.focused$.next(value);
  }

  get focused(): boolean {
    return this.focused$.value;
  }

  /**
   * Waits for element to scroll into view before setting focus animation
   */
  readonly isFocused$: Observable<boolean> = this.focused$.pipe(
    switchMap((focused) =>
      focused
        ? timer(225).pipe(switchMap(() => from(scrollIntoView(this.el.nativeElement)).pipe(map(() => focused))))
        : of(focused)
    )
  );

  constructor(private el: ElementRef) {}
}
