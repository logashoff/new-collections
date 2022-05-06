import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TabGroup } from 'src/app/utils';

/**
 * @description
 *
 * Group of icons displayed in panel header.
 */
@Component({
  selector: 'app-tab-icons',
  templateUrl: './tab-icons.component.html',
  styleUrls: ['./tab-icons.component.scss'],
})
export class TabIconsComponent {
  private readonly group$ = new BehaviorSubject<TabGroup>(null);

  /**
   * Tab group.
   */
  @Input() set group(value: TabGroup) {
    this.group$.next(value);
  }

  get group(): TabGroup {
    return this.group$.value;
  }

  /**
   * Max number of icons should be displayed in panel header.
   */
  readonly maxIconsLength = 7;
}
