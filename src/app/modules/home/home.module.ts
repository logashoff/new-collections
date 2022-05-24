import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared';
import { DevicesComponent, HomeComponent, TopSitesComponent } from './components/index';
import { HomeService } from './services';

const components = [HomeComponent, TopSitesComponent, DevicesComponent];

const routes: Routes = [{ path: '', component: HomeComponent }];

@NgModule({
  declarations: components,
  exports: components,
  providers: [HomeService],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class HomeModule {}
