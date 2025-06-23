import { _CdkPrivateStyleLoader } from '@angular/cdk/private';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';

const fadeIn: Keyframe[] = [
  {
    opacity: 0,
  },
  {
    opacity: 1,
  },
];

const fadeOut: Keyframe[] = [
  {
    opacity: 1,
  },
  {
    opacity: 0,
  },
];

const rotate: Keyframe[] = [
  {
    transform: 'rotate(0deg)',
  },
  {
    transform: 'rotate(360deg)',
  },
];

const cubicEase = 'cubic-bezier(0.4, 0, 0.2, 1)';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: 'ripple.scss',
  host: { 'ripple-style-loader': '' },
})
class RippleStylesLoader {}

@Directive({
  selector: '[ripple]',
})
export class RippleDirective implements OnDestroy {
  readonly #elRef = inject(ElementRef);
  readonly #styleLoader = inject(_CdkPrivateStyleLoader);

  /**
   * True to add ripple animation, false will remove ripple.
   */
  readonly ripple = input.required<boolean>();

  #ripple: HTMLElement;

  constructor() {
    this.#styleLoader.load(RippleStylesLoader);

    effect(() => {
      if (this.ripple()) {
        if (!document.body.contains(this.#ripple)) {
          if (!this.#ripple) {
            this.#ripple = this.create();
          }

          this.#elRef.nativeElement.appendChild(this.#ripple);
        }
      } else {
        this.destroy();
      }
    });
  }

  private create(): HTMLElement {
    const ripple = document.createElement('div');
    ripple.classList.add('ripple');

    const gradient = document.createElement('div');
    gradient.classList.add('ripple-gradient');
    ripple.appendChild(gradient);

    queueMicrotask(async () => {
      gradient.animate(fadeIn, {
        duration: 1_000,
        easing: 'linear',
        fill: 'forwards',
      });

      gradient.animate(fadeOut, {
        duration: 4_000,
        delay: 4_000,
        easing: cubicEase,
        fill: 'forwards',
      });

      await gradient.animate(rotate, {
        duration: 8_000,
        easing: cubicEase,
        fill: 'forwards',
      }).finished;

      this.destroy();
    });

    return ripple;
  }

  private destroy() {
    if (this.#ripple) {
      this.#ripple.remove();
      this.#ripple = null;
    }
  }

  ngOnDestroy() {
    this.destroy();
  }
}
