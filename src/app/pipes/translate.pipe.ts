import { Pipe, PipeTransform } from '@angular/core';
import { translate } from '../utils';

/**
 * @description
 *
 * Transforms string using chrome.i18n API
 */
@Pipe({
  name: 'translate',
  standalone: true,
})
export class TranslatePipe implements PipeTransform {
  transform(messageName: string, substitutions?: string | string[]): string {
    return translate(messageName, substitutions);
  }
}
