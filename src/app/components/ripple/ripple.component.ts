import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  HostBinding,
  HostListener,
  input,
  OnDestroy,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { concat, from, map, of, Subscription, switchMap, timer } from 'rxjs';
import { scrollIntoView } from '../../utils/index';

/**
 * @description
 *
 * Stretches to fit parent element and plays ripple animation when triggered
 */
@Component({
  selector: 'app-ripple',
  template: '',
  styleUrl: './ripple.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class RippleComponent implements OnInit, OnDestroy {
  readonly focused = input<boolean>();

  readonly isFocused = signal<boolean>(false);
  readonly isFocused$ = toObservable(this.isFocused);

  #focusSub: Subscription;

  @HostBinding('class.focused')
  private _focused = false;

  @HostListener('mousedown')
  mousedown() {
    this.isFocused.set(false);
  }

  constructor(
    private el: ElementRef,
    private cdr: ChangeDetectorRef
  ) {
    effect(() => this.isFocused.set(this.focused()), { allowSignalWrites: true });
  }

  ngOnInit() {
    this.#focusSub = this.isFocused$
      .pipe(
        switchMap((focused) =>
          focused
            ? concat(
                timer(225).pipe(switchMap(() => from(scrollIntoView(this.el.nativeElement)).pipe(map(() => true)))),
                timer(1000).pipe(map(() => false))
              )
            : of(false)
        )
      )
      .subscribe((focused) => {
        this._focused = focused;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy() {
    this.#focusSub.unsubscribe();
  }
}
