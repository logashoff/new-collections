import { Pipe, PipeTransform } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

import { sanitizeHtml } from '../utils';

/**
 * @description
 *
 * Sanitizes string as safe HTML
 */
@Pipe({
  name: 'html',
})
export class HtmlPipe implements PipeTransform {
  private readonly sanitizeHtml = sanitizeHtml();

  transform(value: string): SafeHtml {
    return this.sanitizeHtml(value);
  }
}
