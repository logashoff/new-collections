import { ChangeDetectionStrategy, Component, input, Input, ViewEncapsulation } from '@angular/core';
import { IconSize, ImageSource } from '../../utils/index';
import { ImageComponent } from '../image/image.component';

/**
 * @description
 *
 * Icon with background and label.
 */
@Component({
  selector: 'app-chip',
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [ImageComponent],
})
export class ChipComponent {
  /**
   * Image source URL
   */
  readonly source = input<ImageSource>();

  /**
   * Image size
   */
  readonly size = input<IconSize>('medium');

  /**
   * Text to display next to icon
   */
  readonly label = input<string>();

  /**
   * Hide label
   */
  readonly labelHidden = input<boolean>(true);
}
