import { Component, Input, ViewEncapsulation } from '@angular/core';
import { groupBy } from 'lodash';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { TabGroup, Time } from 'src/app/utils';
import * as moment from 'moment';

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
}
