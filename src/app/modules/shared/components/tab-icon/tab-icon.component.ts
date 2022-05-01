import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Domain } from 'src/app/utils';

/**
 * @description
 *
 * Tab icon displayed in panel header.
 */
@Component({
  selector: 'app-tab-icon',
  templateUrl: './tab-icon.component.html',
  styleUrls: ['./tab-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabIconComponent {
  /**
   * Domain data.
   */
  @Input() domain: Domain;

  /**
   * Displays domain name next to icon.
   */
  @Input() showDomainName = false;
}
