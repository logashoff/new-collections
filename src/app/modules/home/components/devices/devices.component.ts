import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import {
  BrowserTab,
  Devices,
  restoreTabs,
  Sessions,
  Tabs,
  trackByDevice,
  trackBySession,
  trackByTabId,
} from 'src/app/utils';
import { HomeService } from '../../services';

/**
 * @description
 *
 * Devices list expansion panel
 */
@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class DevicesComponent {
  readonly devices$: Observable<Devices> = this.homeService.devices$.pipe(shareReplay(1));

  readonly deviceHostnameGroup$ = this.homeService.deviceHostnameGroup$;

  readonly trackByDevice = trackByDevice;
  readonly trackBySession = trackBySession;
  readonly trackByTabId = trackByTabId;
  readonly restoreTabs = restoreTabs;

  constructor(private homeService: HomeService) {}

  /**
   * Returns tab list from all synced session's windows
   */
  getTabsFromSessions(sessions: Sessions): Tabs {
    return this.homeService.getTabsFromSessions(sessions);
  }

  /**
   * Handles list item click
   */
  handleItemClick(tab: BrowserTab) {
    window.open(tab.url, '_blank');
  }
}
