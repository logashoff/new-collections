import { Component, Input } from '@angular/core';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
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
  readonly icons$: Observable<HostnameGroup> = this.group$.pipe(
    switchMap((group) => this.tabService.tabsByHostname$.pipe(map((hostGroups) => hostGroups?.[group.id])))
  );

  /**
   * Max number of icons should be displayed in panel header.
   */
  readonly maxIconsLength = 7;

  constructor(private tabService: TabService) {}
}
