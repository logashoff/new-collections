import { Component, Input } from '@angular/core';
import { isNil } from 'lodash';
import { BehaviorSubject, filter, map, Observable, shareReplay, withLatestFrom } from 'rxjs';
import { TabService } from 'src/app/services';
import { HostnameGroup, TabGroup } from 'src/app/utils';

/**
 * Expansion panel header layout container.
 */
@Component({
  selector: 'app-panel-header',
  templateUrl: './panel-header.component.html',
  styleUrls: ['./panel-header.component.scss'],
})
export class PanelHeaderComponent {
  private readonly group$ = new BehaviorSubject<TabGroup>(null);

  /**
   * Tabs list used to calculate tabs count label.
   */
  @Input() set group(value: TabGroup) {
    this.group$.next(value);
  }

  get group(): TabGroup {
    return this.group$.value;
  }

  /**
   * Grouped icons.
   */
  readonly icons$: Observable<HostnameGroup> = this.tabService.tabsByHostname$.pipe(
    filter((tabsByHostname) => !isNil(tabsByHostname)),
    withLatestFrom(this.group$),
    map(([tabsByHostname, group]) => tabsByHostname[group.id]),
    shareReplay(1)
  );

  /**
   * Track icons by icon count.
   */
  readonly trackByIcons = (_, icons: HostnameGroup): number => icons.length;

  /**
   * Max number of icons should be displayed in panel header.
   */
  readonly maxIconsLength = 7;

  constructor(private tabService: TabService) {}
}
