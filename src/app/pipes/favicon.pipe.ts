import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageSource, getFaviconUrl } from '../utils/index';

/**
 * @description
 *
 * Returns favicon fallback image when original URL is missing
 */
@Pipe({
  name: 'favicon',
  standalone: true,
})
export class FaviconPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(favIconUrl: string, originUrl?: string): ImageSource {
    try {
      const url = new URL(favIconUrl);

      return url.href;
    } catch (e) {
      return this.sanitizer.bypassSecurityTrustUrl(getFaviconUrl(originUrl));
    }
  }
}
