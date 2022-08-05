import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { getFaviconUrl, IconSize, ImageSource } from 'src/app/utils';

/**
 * @description
 *
 * Displays images as small icons.
 */
@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
