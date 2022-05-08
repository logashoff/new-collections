import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconSize } from 'src/app/utils';

/**
 * @description
 *
 * Icon with background and label.
 */
@Component({
  selector: 'app-icon-chip',
  templateUrl: './icon-chip.component.html',
  styleUrls: ['./icon-chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconChipComponent {
  /**
   * Image source URL
   */
  @Input() source: string;

  /**
   * Image size
   */
  @Input() size: IconSize = 'medium';

  /**
   * Text to display next to icon
   */
  @Input() label: string;

  /**
   * Hide label
   */
  @Input() labelHidden = true;
}
