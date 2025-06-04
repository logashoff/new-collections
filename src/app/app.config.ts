import { ApplicationConfig, Provider, provideZonelessChangeDetection } from '@angular/core';

import { provideAnimations, provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withHashLocation } from '@angular/router';

import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

const animations: Provider[] = environment.e2e ? provideNoopAnimations() : provideAnimations();

export const appConfig: ApplicationConfig = {
  providers: [animations, provideRouter(appRoutes, withHashLocation()), provideZonelessChangeDetection()],
};
