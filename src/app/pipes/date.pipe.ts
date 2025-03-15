import { Pipe, PipeTransform } from '@angular/core';
import { DateArg } from 'date-fns';
import { formatDate } from '../utils';

/**
 * @description
 *
 * Localized date formatter pipe
 */
@Pipe({
  name: 'date',
})
export class DatePipe implements PipeTransform {
  transform(value: DateArg<Date>, formatStr = 'PP'): string {
    return formatDate(value, formatStr);
  }
}
