import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { uniqBy } from 'lodash-es';
import { BehaviorSubject, defer, map, Observable, shareReplay, switchMap } from 'rxjs';

import { copyStorage, getSettings, MostVisitedURL, Settings, settingsStorageKey, StorageArea } from '../utils';

/**
 * @description
 *
 * Settings config service for retrieving and saving app settings from Options page
 */
@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  readonly #router = inject(Router);

  private readonly settingsSource$ = new BehaviorSubject<Settings>(null);

  /**
   * Settings config
   */
  readonly settings$: Observable<Settings> = this.settingsSource$.pipe(
    switchMap(() => defer(() => getSettings())),
    shareReplay(1)
  );

  /**
   * Hashmap of expanded panel states by group ID
   */
  readonly panelStates$ = this.settings$.pipe(
    map((settings) => settings?.panels?.[this.#router.url]),
    shareReplay(1)
  );

  private saveSettings(settings: Settings): Promise<void> {
    return chrome.storage.local.set({ [settingsStorageKey]: settings });
  }

  /**
   * Updates and saves new settings
   */
  async update(settings: Settings): Promise<Settings> {
    const currentSettings = (await getSettings()) ?? {};

    const newSettings = {
      ...currentSettings,
      ...settings,
    };

    if (newSettings.ignoreTopSites?.length > 0) {
      newSettings.ignoreTopSites = uniqBy(newSettings.ignoreTopSites, (site) => site.url);
    }

    if (typeof newSettings.syncStorage !== 'undefined') {
      const { sync, local } = chrome.storage;
      const source: StorageArea = newSettings.syncStorage ? local : sync;
      const target: StorageArea = newSettings.syncStorage ? sync : local;

      await copyStorage(source, target);
    }

    await this.saveSettings(newSettings);
    this.settingsSource$.next(newSettings);

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
    const { url } = this.#router;

    const settings = (await getSettings()) ?? {};

    if (!settings.panels) {
      settings.panels = {};
    }

    if (!settings.panels[url]) {
      settings.panels[url] = {};
    }

    settings.panels[url][groupId] = state;

    await this.update(settings);
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
