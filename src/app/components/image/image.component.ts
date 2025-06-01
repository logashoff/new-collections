import { NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
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
    '[class.medium]': 'medium()',
    '[class.small]': 'small()',
  },
})
export class ImageComponent {
  readonly #sanitizer = inject(DomSanitizer);

  /**
   * Image source path.
   */
  readonly source = model.required<ImageSource>();

  /**
   * Icon size.
   */
  readonly size = input<IconSize>('medium');

  readonly medium = computed(() => this.size() === 'medium');

  readonly small = computed(() => this.size() === 'small');

  /**
   * Handles image loading error
   */
  onError() {
    if (typeof this.source() === 'string') {
      try {
        const source = this.source() as string;
        const favicon = getFaviconUrl(source);
        const safeUrl = this.#sanitizer.bypassSecurityTrustUrl(favicon);
        this.source.set(safeUrl);
      } catch (e) {}
    }
  }
}
