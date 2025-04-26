import { Pipe, PipeTransform } from '@angular/core';
import { LocaleMessage, translate } from '../utils';

/**
 * @description
 *
 * Transforms string using chrome.i18n API
 */
@Pipe({
  name: 'translate',
})
export class TranslatePipe implements PipeTransform {
  transform(messageName: LocaleMessage, substitutions?: string | string[]): string {
    return translate(messageName, substitutions);
  }
}
