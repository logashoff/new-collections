import { MatFabMenuModule } from '@angular-material-extensions/fab-menu';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { EmptyComponent, GroupComponent, GroupsComponent } from './components';
import { LayoutComponent } from './layout/layout.component';

const components = [GroupsComponent, GroupComponent, LayoutComponent, EmptyComponent];

const routes: Routes = [{ path: '', component: LayoutComponent }];

@NgModule({
  declarations: components,
  exports: components,
  imports: [CommonModule, SharedModule, MatFabMenuModule, RouterModule.forChild(routes)],
})
export class TabsModule {}
