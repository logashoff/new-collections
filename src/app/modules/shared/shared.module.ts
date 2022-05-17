import { MatFabMenuModule } from '@angular-material-extensions/fab-menu';
import { A11yModule } from '@angular/cdk/a11y';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
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
  TimelineComponent,
} from './components/index';
import { ScrollIntoViewDirective, StopPropagationDirective } from './directives/index';

const components = [
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
  ScrollIntoViewDirective,
  SearchComponent,
  StopPropagationDirective,
  TabListComponent,
  TimelineComponent,
];

const materialModules = [
  A11yModule,
  ClipboardModule,
  MatAutocompleteModule,
  MatBadgeModule,
  MatBottomSheetModule,
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatFabMenuModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatToolbarModule,
  MatTooltipModule,
  OverlayModule,
  PortalModule,
  ScrollingModule,
];

@NgModule({
  declarations: [...components],
  imports: [CommonModule, ReactiveFormsModule, ...materialModules],
  exports: [...materialModules, ...components],
})
export class SharedModule {}
