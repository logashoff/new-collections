import { Pipe, PipeTransform } from '@angular/core';
import { DateArg, format } from 'date-fns';

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
    if (typeof value === 'number') {
      value = Math.abs(value);
    }

    return format(value, formatStr);
  }
}
