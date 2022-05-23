import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared';
import { HomeComponent } from './components/index';

const components = [HomeComponent];

const routes: Routes = [{ path: '', component: HomeComponent }];

@NgModule({
  declarations: components,
  exports: components,
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class HomeModule {}
