import { Routes } from '@angular/router';

export const popupRoutes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  {
    path: 'main',
    loadComponent: async () => {
      const { PopupContentComponent } = await import('../popup-content/popup-content.component');
      return PopupContentComponent;
    },
  },
  {
    path: 'search',
    loadComponent: async () => {
      const { PopupSearchComponent } = await import('../popup-search/popup-search.component');
      return PopupSearchComponent;
    },
  },
];
