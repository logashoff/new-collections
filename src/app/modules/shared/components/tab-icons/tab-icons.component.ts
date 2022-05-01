import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabIconsComponent {
  /**
   * Tab group.
   */
  @Input() group: TabGroup;
}
