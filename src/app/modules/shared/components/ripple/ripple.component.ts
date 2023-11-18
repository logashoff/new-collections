import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject, concat, from, map, of, switchMap, timer } from 'rxjs';
import { scrollIntoView } from 'src/app/utils';

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

  @HostBinding('class.focused')
  private _focused = false;

  @HostListener('mousedown')
  mousedown() {
    this.focused = false;
  }

  constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.focused$
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
    this.focused$.complete();
  }
}
