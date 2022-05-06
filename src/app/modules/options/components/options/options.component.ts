import { MatFabMenu } from '@angular-material-extensions/fab-menu';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { Action, MenuService, TabService } from 'src/app/services';
import { TabGroup } from 'src/app/utils';

/**
 * @description
 *
 * Extension Options page.
 */
@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsComponent {
  /**
   * Data source for stored tab groups.
   */
  readonly groups$: Observable<TabGroup[]> = this.tabsService.tabGroups$;

  /**
   * Main menu items.
   */
  readonly menuItems$: Observable<MatFabMenu[]> = this.menuService.menuItems$.pipe(
    map((menuItems) => menuItems.filter((item) => ![Action.Options, Action.Save].includes(item.id as Action))),
    shareReplay(1)
  );

  constructor(private tabsService: TabService, private menuService: MenuService) {}
}
