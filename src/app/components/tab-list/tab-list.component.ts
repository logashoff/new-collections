import { Component, ViewEncapsulation } from '@angular/core';
import { MatListModule } from '@angular/material/list';

/**
 * @description
 *
 * Tabs list component
 */
@Component({
  selector: 'app-tab-list',
  templateUrl: './tab-list.component.html',
  styleUrl: './tab-list.component.scss',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MatListModule],
})
export class TabListComponent {}
