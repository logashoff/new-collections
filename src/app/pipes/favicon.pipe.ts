import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageSource, getFaviconUrl } from '../utils';

/**
 * @description
 *
 * Returns favicon fallback image when original URL is missing
 */
@Pipe({
  name: 'favicon',
})
export class FaviconPipe implements PipeTransform {
  readonly #sanitizer = inject(DomSanitizer);

  transform(favIconUrl: string, originUrl?: string): ImageSource {
    try {
      const url = new URL(favIconUrl);

      return url.href;
    } catch (e) {
      return this.#sanitizer.bypassSecurityTrustUrl(getFaviconUrl(originUrl));
    }
  }
}
