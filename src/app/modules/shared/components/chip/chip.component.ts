import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { IconSize, ImageSource } from 'src/app/utils';

/**
 * @description
 *
 * Icon with background and label.
 */
@Component({
  selector: 'app-chip',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ChipComponent {
  /**
   * Image source URL
   */
  @Input() source: ImageSource;

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
