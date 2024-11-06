import { Pipe, PipeTransform } from '@angular/core';
import { DateArg, format } from 'date-fns';

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
  transform(value: DateArg<Date>, formatStr = 'PPPP'): string {
    return format(value, formatStr);
  }
}
