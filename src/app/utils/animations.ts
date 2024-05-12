import {
  AnimationTriggerMetadata,
  animate,
  animateChild,
  group,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const listItemAnimation: AnimationTriggerMetadata = trigger('listItemAnimation', [
  transition(':enter', [
    query('.container', [
      style({
        transform: 'translateY(-1rem)',
        opacity: 0,
      }),
      animate(
        '150ms ease-in',
        style({
          transform: 'translateY(0)',
          opacity: 1,
        })
      ),
    ]),
  ])
]);

const routerTimings = '250ms ease';

export const routeAnimations: AnimationTriggerMetadata = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      }),
    ]),
    query(':enter', style({ opacity: 0, transform: 'translate(0, -1rem)' }), { optional: true }),
    query(':leave', animateChild(), { optional: true }),
    group([
      query(':leave', [animate(routerTimings, style({ transform: 'translate(0, 0)', opacity: 0 }))], {
        optional: true,
      }),
      query(':enter', [animate(routerTimings, style({ transform: 'translate(0, 0)', opacity: 1 }))], {
        optional: true,
      }),
    ]),
  ]),
]);
