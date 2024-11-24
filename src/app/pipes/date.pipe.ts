import { Pipe, PipeTransform } from '@angular/core';
import { DateArg, format } from 'date-fns';
import { isNumber } from 'lodash-es';

/**
 * @description
 *
 * Localized date formatter pipe
 */
@Pipe({
  name: 'date',
  standalone: true,
})
export class DatePipe implements PipeTransform {
  transform(value: DateArg<Date>, formatStr = 'PP'): string {
    if (isNumber(value)) {
      value = Math.abs(value);
    }

    return format(value, formatStr);
  }
}
