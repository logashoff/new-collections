import { Routes } from '@angular/router';

export const newTabRoutes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  {
    path: 'main',
    loadComponent: async () => {
      const { NewTabContentComponent } = await import('../new-tab-content/new-tab-content.component');
      return NewTabContentComponent;
    },
  },
  {
    path: 'search',
    loadComponent: async () => {
      const { NewTabSearchComponent } = await import('../new-tab-search/new-tab-search.component');
      return NewTabSearchComponent;
    },
  },
];
