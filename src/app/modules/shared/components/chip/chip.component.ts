import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { getFaviconUrl, IconSize, ImageSource } from 'src/app/utils';

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
})
export class ChipComponent {
  /**
   * Image source URL
   */
  @Input() source: ImageSource

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
