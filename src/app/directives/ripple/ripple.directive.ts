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
import { clamp } from 'lodash-es';

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
    transform: 'rotate(450deg)',
  },
];

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

  readonly rippleDelay = input<number>(0);

  #ripple: HTMLElement;

  readonly #resizeObserver = new ResizeObserver((entries) => {
    const [
      {
        contentRect: { width, height },
        target,
      },
    ] = entries;

    const gradient: HTMLElement = target.children[0] as HTMLElement;
    if (gradient) {
      const ratio = width > height ? width / height : height / width;

      if (width > height) {
        gradient.style.scale = `${clamp(ratio, 2, 8)} 1`;
      } else {
        gradient.style.scale = `${Math.max(ratio, 2)} ${2 * ratio}`;
      }
    }
  });

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

    this.#resizeObserver.observe(ripple);

    queueMicrotask(async () => {
      const delay = this.rippleDelay();

      gradient.animate(fadeIn, {
        duration: 2_000,
        delay,
        easing: 'linear',
        fill: 'forwards',
      });

      gradient.animate(rotate, {
        duration: 8_000,
        delay,
        easing: 'cubic-bezier(0.2, 0, 0, 1)',
        fill: 'forwards',
      });

      await gradient.animate(fadeOut, {
        duration: 2_000,
        delay: 6_000 + delay,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards',
      }).finished;

      this.destroy();
    });

    return ripple;
  }

  private destroy() {
    if (this.#ripple) {
      this.#resizeObserver.disconnect();
      this.#ripple.remove();
      this.#ripple = null;
    }
  }

  ngOnDestroy() {
    this.destroy();
  }
}
