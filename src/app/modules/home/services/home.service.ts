import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { from, map, Observable, shareReplay } from 'rxjs';
import { Devices, getUrlHostname, MostVisitedURL, TopSite, TopSites } from 'src/app/utils';

/**
 * @description
 *
 * Home service contains data for synced devices and top sites
 */
@Injectable()
export class HomeService {
  readonly topSites$: Observable<TopSites> = from(this.getTopSites()).pipe(
    map(
      (sites): TopSites =>
        sites?.length > 0
          ? sites.map(
              (site): TopSite => ({
                ...site,
                favIconUrl: this.getFavIconUrl(getUrlHostname(site.url)),
                pinned: false,
                active: false,
              })
            )
          : null
    ),
    shareReplay(1)
  );

  readonly devices$: Observable<Devices> = from(this.getDevices()).pipe(
    map((devices) => (devices?.length > 0 ? devices : null)),
    shareReplay(1)
  );

  constructor(private sanitizer: DomSanitizer) {}

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
