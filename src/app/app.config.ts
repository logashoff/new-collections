import { ApplicationConfig } from '@angular/core';

import { provideAnimations } from '@angular/platform-browser/animations';
import { PreloadAllModules, provideRouter, withHashLocation, withPreloading } from '@angular/router';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideAnimations(), provideRouter(appRoutes, withPreloading(PreloadAllModules), withHashLocation())],
};
