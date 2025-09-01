import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, RouterFeatures, withHashLocation, withViewTransitions } from '@angular/router';

import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

const routeFeatures: RouterFeatures[] = [withHashLocation()];

if (!environment.e2e) {
  routeFeatures.push(withViewTransitions());
}

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(appRoutes, ...routeFeatures), provideZonelessChangeDetection()],
};
