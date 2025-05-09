import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
import { IconSize, ImageSource } from '../../utils';
import { ImageComponent } from '../image/image.component';

/**
 * @description
 *
 * Icon with background and label.
 */
@Component({
  selector: 'nc-chip',
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [ImageComponent],
})
export class ChipComponent {
  /**
   * Image source URL
   */
  readonly source = input.required<ImageSource>();

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
