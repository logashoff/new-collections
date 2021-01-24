import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'popup', loadChildren: () => import('./modules/tabs/tabs.module').then((m) => m.TabsModule) },
  { path: '', redirectTo: 'popup', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
