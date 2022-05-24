import { ChangeDetectionStrategy, Component } from '@angular/core';
import { flatMap } from 'lodash';
import { Observable, tap } from 'rxjs';
import { BrowserTab, Devices, Sessions, Tabs, trackByDevice, trackBySession, trackByTabId } from 'src/app/utils';
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
})
export class DevicesComponent {
  readonly devices$: Observable<Devices> = this.homeService.devices$.pipe(tap((dd) => console.log(dd)));

  readonly trackByDevice = trackByDevice;
  readonly trackBySession = trackBySession;
  readonly trackByTabId = trackByTabId;

  constructor(private homeService: HomeService) {}

  getTabsFromSessions(sessions: Sessions): Tabs {
    return flatMap(sessions, (session) => session.tab || session.window?.tabs);
  }

  handleItemClick(tab: BrowserTab) {

  }
}
