import { MatFabMenu } from '@angular-material-extensions/fab-menu';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { MenuService, SearchService, TabService } from 'src/app/services';
import { Action, Timeline } from 'src/app/utils';

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
   * Tab groups grouped by time
   */
  readonly groupsTimeline$: Observable<Timeline> = this.tabsService.groupsTimeline$.pipe(shareReplay(1));

  /**
   * Main menu items.
   */
  readonly menuItems$: Observable<MatFabMenu[]> = this.menuService.menuItems$.pipe(
    map((menuItems) => menuItems.filter((item) => ![Action.Options, Action.Save].includes(item.id as Action))),
    shareReplay(1)
  );

  /**
   * Source for search results.
   */
  readonly searchResults$ = this.searchService.searchResults$;

  constructor(
    private menuService: MenuService,
    private searchService: SearchService,
    private tabsService: TabService
  ) {}

  /**
   * Handles tab removal event.
   */
  tabRemoved() {
    this.tabsService.refresh();
  }
}
