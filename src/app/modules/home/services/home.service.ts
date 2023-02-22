import { Injectable } from '@angular/core';
import flatMap from 'lodash/flatMap';
import isNil from 'lodash/isNil';
import isUndefined from 'lodash/isUndefined';
import { combineLatest, from, map, Observable, of, shareReplay, switchMap, take } from 'rxjs';
import { SettingsService, TabService } from 'src/app/services';
import { BrowserTabs, Devices, MostVisitedURL, Sessions, TabGroup, Tabs, Timeline, TopSites } from 'src/app/utils';

/**
 * @description
 *
 * Home service contains data for synced devices and top sites
 */
@Injectable()
export class HomeService {
  /**
   * Top sites list
   */
  readonly topSites$: Observable<TopSites> = this.settings.settings$.pipe(
    switchMap((settings) => {
      if (isUndefined(settings?.enableTopSites) || settings?.enableTopSites) {
        return from(this.getTopSites()).pipe(
          map(
            (sites): TopSites =>
              sites?.length > 0
                ? sites.filter((site) => !settings?.ignoreTopSites?.some(({ url }) => url === site.url))
                : null
          )
        );
      }

      return of(null);
    }),
    shareReplay(1)
  );

  /**
   * Synced devices list
   */
  readonly devices$: Observable<Devices> = this.settings.settings$.pipe(
    take(1),
    switchMap((settings) => {
      if (isUndefined(settings?.enableDevices) || settings?.enableDevices) {
        return from(this.getDevices()).pipe(map((devices) => (devices?.length > 0 ? devices : null)));
      }

      return of(null);
    }),
    shareReplay(1)
  );

  /**
   * Icons shown in panel header
   */
  readonly devicesTimeline$: Observable<Timeline> = this.devices$.pipe(
    take(1),
    map((devices) => {
      if (devices?.length > 0) {
        return devices.map((device) => ({
          label: device.deviceName,
          elements: device.sessions
            .filter((session) => session?.window?.tabs?.length > 0)
            .map(
              (session) =>
                new TabGroup({
                  id: session.window.sessionId,
                  timestamp: session.lastModified * 1000,
                  tabs: session.window.tabs,
                })
            ),
        }));
      }

      return null;
    }),
    shareReplay(1)
  );

  readonly searchSource$: Observable<BrowserTabs> = combineLatest([this.devices$, this.tabsService.tabs$]).pipe(
    map(([devices, tabs]) => {
      const ret: BrowserTabs = flatMap(devices?.map((device) => this.getTabsFromSessions(device.sessions))) ?? [];

      if (tabs?.length > 0) {
        ret.push(...tabs);
      }

      return ret;
    }),
    shareReplay(1)
  );

  /**
   * Tab groups grouped by time
   */
  readonly timeline$: Observable<Timeline> = this.tabsService.groupsTimeline$;

  /**
   * Indicates if timeline, top sites or devices data is present
   */
  readonly hasAnyData$: Observable<boolean> = combineLatest([this.devices$, this.timeline$, this.topSites$]).pipe(
    map(([devices, timeline, topSites]) => !isNil(timeline) || !isNil(devices) || !isNil(topSites)),
    shareReplay(1)
  );

  constructor(private settings: SettingsService, private tabsService: TabService) {}

  private getDevices(): Promise<Devices> {
    return new Promise((resolve) => chrome.sessions.getDevices((devices) => resolve(devices)));
  }

  private getTopSites(): Promise<MostVisitedURL[]> {
    return new Promise((resolve) => chrome.topSites.get((data) => resolve(data)));
  }

  /**
   * Returns tab list from all synced session's windows
   */
  getTabsFromSessions(sessions: Sessions): Tabs {
    return flatMap(sessions, (session) => session.tab || session.window?.tabs);
  }
}
