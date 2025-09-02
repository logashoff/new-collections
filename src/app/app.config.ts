import { ApplicationConfig, inject, provideZonelessChangeDetection } from '@angular/core';
import {
  IsActiveMatchOptions,
  provideRouter,
  Router,
  RouterFeatures,
  withHashLocation,
  withViewTransitions,
} from '@angular/router';

import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

const routeFeatures: RouterFeatures[] = [withHashLocation()];

if (!environment.e2e) {
  routeFeatures.push(
    withViewTransitions({
      onViewTransitionCreated: ({ transition }) => {
        const router = inject(Router);
        const targetUrl = router.currentNavigation()!.finalUrl!;

        const config: IsActiveMatchOptions = {
          paths: 'exact',
          matrixParams: 'exact',
          fragment: 'ignored',
          queryParams: 'ignored',
        };

        if (router.isActive(targetUrl, config)) {
          transition.skipTransition();
        }
      },
    })
  );
}

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(appRoutes, ...routeFeatures), provideZonelessChangeDetection()],
};
