import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { IconSize, ImageSource, getFaviconUrl } from '../../utils/index';

/**
 * @description
 *
 * Displays images as small icons.
 */
@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class ImageComponent {
  /**
   * Image source path.
   */
  @Input() source: ImageSource;

  /**
   * Icon size.
   */
  @Input() size: IconSize = 'medium';

  @HostBinding('class.medium') get medium(): boolean {
    return this.size === 'medium';
  }

  @HostBinding('class.small') get small(): boolean {
    return this.size === 'small';
  }

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Handles image loading error
   */
  onError() {
    if (typeof this.source === 'string') {
      try {
        this.source = this.sanitizer.bypassSecurityTrustUrl(getFaviconUrl(this.source));
      } catch (e) {}
    }
  }
}
