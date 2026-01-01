import { inject, Pipe, PipeTransform } from '@angular/core';

import { TabService } from '../services';
import { TabGroup } from '../utils';

/**
 * @description
 *
 * Check if tab group is part of saved tab groups
 */
@Pipe({
  name: 'isReadOnlyGroup',
})
export class IsReadOnlyGroupPipe implements PipeTransform {
  readonly #tabService = inject(TabService);

  transform(group: TabGroup): boolean {
    return !this.#tabService.hasTabGroup(group);
  }
}
