import { Routes } from '@angular/router';
import { HomeService } from './services';

export const appRoutes: Routes = [
  {
    path: 'new-tab',
    providers: [HomeService],
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
  },
  {
    path: 'options',
    loadComponent: async () => {
      const { OptionsComponent } = await import('./components/options/options.component');
      return OptionsComponent;
    },
  },
];
