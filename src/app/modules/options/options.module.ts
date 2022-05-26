import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterModule, Routes } from '@angular/router';
import { OptionsComponent } from './components/intex';

const components = [OptionsComponent];

const routes: Routes = [{ path: '', component: OptionsComponent }];

@NgModule({
  declarations: components,
  exports: components,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
})
export class OptionsModule {}
