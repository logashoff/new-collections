import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';

import { provideRouter, withHashLocation, withViewTransitions } from '@angular/router';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(appRoutes, withHashLocation(), withViewTransitions()), provideZonelessChangeDetection()],
};
