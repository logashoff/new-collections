import { Routes } from '@angular/router';

export const popupRoutes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  {
    path: 'main',
    loadComponent: () => import('../popup-content/popup-content.component').then((m) => m.PopupContentComponent),
  },
  {
    path: 'search',
    loadComponent: () => import('../popup-search/popup-search.component').then((m) => m.PopupSearchComponent),
  },
];
