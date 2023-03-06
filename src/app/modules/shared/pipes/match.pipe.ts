import { Pipe, PipeTransform } from '@angular/core';
import Fuse from 'fuse.js';
import escape from 'lodash/escape';

/**
 * @description
 *
 * Returns string highlighted based on search results indices.
 */
@Pipe({
  name: 'match',
})
export class MatchPipe implements PipeTransform {
  transform(value: string, matchIndices: Readonly<Fuse.RangeTuple[]>): string {
    if (matchIndices?.length > 0) {
      let res = '';
      let lastIndex = 0;

      matchIndices.forEach((indices) => {
        const [start, end] = indices;
        const prefix = lastIndex !== start ? escape(value.slice(lastIndex, start)) : '';
        const suffix = escape(value.slice(start, end + 1));
        res += `${prefix}<mark>${suffix}</mark>`;
        lastIndex = end + 1;
      });

      if (lastIndex < value.length) {
        res += escape(`${value.slice(lastIndex, value.length)}`);
      }

      return res;
    }

    return value;
  }
}
