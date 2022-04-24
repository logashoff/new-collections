import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared';
import { OptionsComponent } from './components/intex';

const components = [OptionsComponent];

const routes: Routes = [{ path: '', component: OptionsComponent }];

@NgModule({
  declarations: components,
  exports: components,
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class OptionsModule {}
