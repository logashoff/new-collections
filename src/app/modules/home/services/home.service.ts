import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { isUndefined } from 'lodash';
import { filter, from, map, Observable, shareReplay, switchMap } from 'rxjs';
import { SettingsService } from 'src/app/services';
import { Devices, getUrlHostname, MostVisitedURL, TopSite, TopSites } from 'src/app/utils';

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
    filter((settings) => isUndefined(settings?.enableTopSites) || settings?.enableTopSites),
    switchMap((settings) =>
      from(this.getTopSites()).pipe(
        map(
          (sites): TopSites =>
            sites?.length > 0
              ? sites
                  .filter((site) => !settings?.ignoreTopSites?.some(({ url }) => url === site.url))
                  .map(
                    (site): TopSite => ({
                      ...site,
                      favIconUrl: this.getFavIconUrl(getUrlHostname(site.url)),
                      pinned: false,
                      active: false,
                    })
                  )
              : null
        )
      )
    ),
    shareReplay(1)
  );

  /**
   * Synced devices list
   */
  readonly devices$: Observable<Devices> = this.settings.settings$.pipe(
    filter((settings) => isUndefined(settings?.enableDevices) || settings?.enableDevices),
    switchMap(() => from(this.getDevices()).pipe(map((devices) => (devices?.length > 0 ? devices : null)))),
    shareReplay(1)
  );

  constructor(private sanitizer: DomSanitizer, private settings: SettingsService) {}

  /**
   * Returns fav icon link based on domain name.
   */
  private getFavIconUrl(domain: string): string {
    return this.sanitizer.sanitize(
      SecurityContext.URL,
      // TODO: Temp while waiting for "favicon" manifest permission to get merged into stable channel
      // Manifest changes to be updated: https://chromium.googlesource.com/chromium/src/+/refs/heads/main/chrome/common/extensions/api/_permission_features.json#351
      `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=32`
    );
  }

  getDevices(): Promise<Devices> {
    return new Promise((resolve) => chrome.sessions.getDevices((devices) => resolve(devices)));
  }

  getTopSites(): Promise<MostVisitedURL[]> {
    return new Promise((resolve) => chrome.topSites.get((data) => resolve(data)));
  }
}
