import { NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { getFaviconUrl, IconSize, ImageSource } from '../../utils';

/**
 * @description
 *
 * Displays images as small icons.
 */
@Component({
  selector: 'nc-image',
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, NgOptimizedImage],
  host: {
    '[class.medium]': 'medium',
    '[class.small]': 'small',
  },
})
export class ImageComponent {
  /**
   * Image source path.
   */
  readonly source = model.required<ImageSource>();

  /**
   * Icon size.
   */
  readonly size = input<IconSize>('medium');

  get medium(): boolean {
    return this.size() === 'medium';
  }

  get small(): boolean {
    return this.size() === 'small';
  }

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Handles image loading error
   */
  onError() {
    if (typeof this.source() === 'string') {
      try {
        const source = this.source() as string;
        const favicon = getFaviconUrl(source);
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(favicon);
        this.source.set(safeUrl);
      } catch (e) {}
    }
  }
}
