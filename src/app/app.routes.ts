import { Routes } from '@angular/router';
import { HomeService } from './services';
import { IS_POPUP } from './utils';

export const appRoutes: Routes = [
  {
    path: 'new-tab',
    providers: [
      HomeService,
      {
        provide: IS_POPUP,
        useValue: false,
      },
    ],
    loadComponent: async () => {
      const { NewTabComponent } = await import('./components/new-tab/new-tab.component');
      return NewTabComponent;
    },
    loadChildren: async () => {
      const { newTabRoutes } = await import('./components/new-tab/new-tab.routes');
      return newTabRoutes;
    },
  },
  {
    path: 'popup',
    loadComponent: async () => {
      const { PopupComponent } = await import('./components/popup/popup.component');
      return PopupComponent;
    },
    loadChildren: async () => {
      const { popupRoutes } = await import('./components/popup/popup.routes');
      return popupRoutes;
    },
    providers: [
      {
        provide: IS_POPUP,
        useValue: true,
      },
    ],
  },
  {
    path: 'options',
    loadComponent: async () => {
      const { OptionsComponent } = await import('./components/options/options.component');
      return OptionsComponent;
    },
  },
];
