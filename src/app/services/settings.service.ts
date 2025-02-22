import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { uniqBy } from 'lodash-es';
import { BehaviorSubject, Observable, from, map, shareReplay, switchMap } from 'rxjs';
import { MostVisitedURL, Settings, StorageArea, copyStorage, getSettings, settingsStorageKey } from '../utils';

/**
 * @description
 *
 * Settings config service for retrieving and saving app settings from Options page
 */
@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly settingsSource$ = new BehaviorSubject<Settings>(null);

  /**
   * Settings config
   */
  readonly settings$: Observable<Settings> = this.settingsSource$.pipe(
    switchMap(() => from(getSettings())),
    shareReplay(1)
  );

  /**
   * Hashmap of expanded panel states by group ID
   */
  readonly panelStates$ = this.settings$.pipe(
    map((settings) => settings?.panels?.[this.router.url]),
    shareReplay(1)
  );

  constructor(private router: Router) {}

  private saveSettings(settings: Settings): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [settingsStorageKey]: settings }, () => resolve());
    });
  }

  /**
   * Updates and saves new settings
   */
  async update(settings: Settings) {
    const currentSettings = (await getSettings()) ?? {};

    const newSettings = {
      ...currentSettings,
      ...settings,
    };

    if (newSettings.ignoreTopSites?.length > 0) {
      newSettings.ignoreTopSites = uniqBy(newSettings.ignoreTopSites, (site) => site.url);
    }

    this.saveSettings(newSettings);

    this.settingsSource$.next(newSettings);

    if (typeof newSettings.syncStorage !== 'undefined') {
      const { sync, local } = chrome.storage;
      const source: StorageArea = !newSettings.syncStorage ? sync : local;
      const target: StorageArea = !newSettings.syncStorage ? local : sync;

      await copyStorage(source, target);
    }

    return newSettings;
  }

  /**
   * Updates ignore site list with new site specified
   */
  async ignoreSite(site: MostVisitedURL) {
    const settings = (await getSettings()) ?? {};

    if (settings.ignoreTopSites?.length > 0) {
      settings.ignoreTopSites.push(site);
    } else {
      settings.ignoreTopSites = [site];
    }

    return this.update(settings);
  }

  /**
   * Saves expanded panel state to local storage by group ID
   *
   * @param groupId Panel group ID to save state for
   * @param state True if panel is expanded
   */
  async savePanelState(groupId: string, state: boolean) {
    const { url } = this.router;

    const settings = (await getSettings()) ?? {};

    if (!settings.panels) {
      settings.panels = {};
    }

    if (!settings.panels[url]) {
      settings.panels[url] = {};
    }

    settings.panels[url][groupId] = state;

    this.update(settings);
  }

  /**
   * Returns sync storage usage in bytes
   *
   * @returns Sync storage bytes used
   */
  async getUsageBytes() {
    return await chrome.storage.sync.getBytesInUse();
  }
}
