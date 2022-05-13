import { Component, Input, ViewEncapsulation } from '@angular/core';
import { TabGroup } from 'src/app/utils';

/**
 * @description
 *
 * Displays list of tab groups.
 */
@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GroupsComponent {
  /**
   * List of tab groups to render.
   */
  @Input() groups: TabGroup[];

  readonly trackByGroupId = (_, group: TabGroup): string => group.id;
}
