import { Directive, effect, ElementRef, inject, input, OnDestroy } from '@angular/core';

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

@Directive({
  selector: '[ripple]',
})
export class RippleDirective implements OnDestroy {
  readonly ripple = input.required<boolean>();

  readonly #el = inject(ElementRef);
  #ripple: HTMLDivElement;

  constructor() {
    effect(() => {
      if (!this.#ripple) {
        this.#ripple = this.create();
      }

      if (this.ripple()) {
        if (!document.body.contains(this.#ripple)) {
          this.#el.nativeElement.appendChild(this.#ripple);
        }
      } else {
        this.destroy();
      }
    });
  }

  private create() {
    const ripple = document.createElement('div');
    ripple.classList.add('ripple');

    const gradient = document.createElement('div');
    gradient.classList.add('ripple-gradient');
    ripple.appendChild(gradient);

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

    const animation = gradient.animate(rotate, {
      duration: 8_000,
      easing: cubicEase,
      fill: 'forwards',
    });

    queueMicrotask(async () => {
      await animation.finished;
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
