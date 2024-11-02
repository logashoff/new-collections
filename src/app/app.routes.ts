import { Routes } from '@angular/router';
import { HomeService } from './services';

export const appRoutes: Routes = [
  {
    path: 'new-tab',
    providers: [HomeService],
    loadComponent: () => import('./components/new-tab/new-tab.component').then((m) => m.NewTabComponent),
    loadChildren: () => import('./components/new-tab/new-tab.routes').then((m) => m.newTabRoutes),
  },
  {
    path: 'popup',
    loadComponent: () => import('./components/popup/popup.component').then((m) => m.PopupComponent),
    loadChildren: () => import('./components/popup/popup.routes').then((m) => m.popupRoutes),
  },
  {
    path: 'options',
    loadComponent: () => import('./components/options/options.component').then((m) => m.OptionsComponent),
  },
];
