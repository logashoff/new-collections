import { MatFabMenuModule } from '@angular-material-extensions/fab-menu';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { EmptyComponent, GroupComponent, GroupsComponent } from './components';
import { LayoutComponent } from './layout/layout.component';

const components = [GroupsComponent, GroupComponent, LayoutComponent, EmptyComponent];

@NgModule({
  declarations: components,
  exports: components,
  imports: [CommonModule, SharedModule, MatFabMenuModule],
})
export class TabsModule {}
