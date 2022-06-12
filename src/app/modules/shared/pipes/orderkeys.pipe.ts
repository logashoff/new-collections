import { Pipe, PipeTransform } from '@angular/core';

/**
 * @description
 *
 * Converts object into array of objects with key and value properties
 * Objects are ordered by key insertion order in the original object
 */
@Pipe({
  name: 'orderkeys',
})
export class OrderkeysPipe implements PipeTransform {
  transform(object: any): { [key in string]: any }[] {
    return Object.keys(object).map((key) => ({ key, value: object[key] }));
  }
}
