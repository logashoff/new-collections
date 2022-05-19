import { MatFabMenuModule } from '@angular-material-extensions/fab-menu';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ChipComponent,
  EmptyComponent,
  GroupControlsComponent,
  GroupsComponent,
  ImageComponent,
  ImageDirective,
  MenuComponent,
  MessageComponent,
  PanelHeaderComponent,
  RenameDialogComponent,
  SearchComponent,
  TabListComponent,
  TabsSelectorComponent,
  TimelineComponent,
} from './components/index';
import { ScrollIntoViewDirective, StopPropagationDirective } from './directives/index';
import { HostnamePipe } from './pipes/index';

const declarations = [
  ChipComponent,
  EmptyComponent,
  GroupControlsComponent,
  GroupsComponent,
  HostnamePipe,
  ImageComponent,
  ImageDirective,
  MenuComponent,
  MessageComponent,
  PanelHeaderComponent,
  RenameDialogComponent,
  ScrollIntoViewDirective,
  SearchComponent,
  StopPropagationDirective,
  TabListComponent,
  TabsSelectorComponent,
  TimelineComponent,
];

const materialModules = [
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatFabMenuModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatRippleModule,
  MatSidenavModule,
  MatTooltipModule,
];

@NgModule({
  declarations: [...declarations],
  imports: [CommonModule, ReactiveFormsModule, ...materialModules],
  exports: [...materialModules, ...declarations],
})
export class SharedModule {}
