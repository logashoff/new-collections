import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared';
import { PopupComponent } from './components';

const routes: Routes = [{ path: '', component: PopupComponent }];

@NgModule({
  declarations: [PopupComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class PopupModule {}
