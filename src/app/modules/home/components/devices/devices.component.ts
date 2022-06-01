import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import flatMap from 'lodash/flatMap';
import { map, Observable, shareReplay } from 'rxjs';
import {
  BrowserTab,
  Devices,
  getHostnameGroup,
  HostnameGroup,
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

  readonly deviceHostnameGroup$: Observable<{ [deviceName in string]: HostnameGroup }> = this.devices$.pipe(
    map((devices) => {
      const mapByDeviceName: any = {};

      devices?.forEach(
        (device) => (mapByDeviceName[device.deviceName] = getHostnameGroup(this.getTabsFromSessions(device.sessions)))
      );

      return mapByDeviceName;
    }),
    shareReplay(1)
  );

  readonly trackByDevice = trackByDevice;
  readonly trackBySession = trackBySession;
  readonly trackByTabId = trackByTabId;
  readonly restoreTabs = restoreTabs;

  constructor(private homeService: HomeService) {}

  getTabsFromSessions(sessions: Sessions): Tabs {
    return flatMap(sessions, (session) => session.tab || session.window?.tabs);
  }

  /**
   * Handles list item click
   */
  handleItemClick(tab: BrowserTab) {
    window.open(tab.url, '_blank');
  }
}
