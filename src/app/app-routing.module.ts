import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'popup', loadComponent: () => import('./modules/popup/popup.component').then((m) => m.PopupComponent) },
  { path: 'home', loadComponent: () => import('./modules/home/home.component').then((m) => m.HomeComponent) },
  {
    path: 'options',
    loadComponent: () => import('./modules/options/options.component').then((m) => m.OptionsComponent),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      useHash: true,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
