import { Pipe, PipeTransform } from '@angular/core';
import { TabService } from '../services/index';
import { TabGroup } from '../utils';

/**
 * @description
 * 
 * Check if tab group is part of saved tab groups
 */
@Pipe({
  name: 'isReadOnlyGroup',
  standalone: true
})
export class IsReadOnlyGroupPipe implements PipeTransform {

  constructor(private readonly tabService: TabService) {}

  transform(group: TabGroup): boolean {
    return !this.tabService.hasTabGroup(group);
  }
}
