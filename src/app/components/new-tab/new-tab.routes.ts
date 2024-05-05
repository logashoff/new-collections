import { Routes } from '@angular/router';

export const newTabRoutes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  {
    path: 'main',
    loadComponent: () => import('../new-tab-content/new-tab-content.component').then((m) => m.NewTabContentComponent),
  },
  {
    path: 'search',
    loadComponent: () => import('../new-tab-search/new-tab-search.component').then((m) => m.NewTabSearchComponent),
  },
];
