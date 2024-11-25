import { Pipe, PipeTransform } from '@angular/core';
import { getUrlHostname } from '../utils';

/**
 * @description
 *
 * Transforms URL to hostname
 */
@Pipe({
  name: 'hostname',
})
export class HostnamePipe implements PipeTransform {
  transform(url: string): string {
    return getUrlHostname(url);
  }
}
