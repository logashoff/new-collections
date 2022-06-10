import { Injectable } from '@angular/core';
import isUndefined from 'lodash/isUndefined';
import uniqBy from 'lodash/unionBy';
import { BehaviorSubject, from, Observable, shareReplay, switchMap } from 'rxjs';
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
  private readonly settingsSource$ = new BehaviorSubject<Settings>(null);

  /**
   * Settings config
   */
  readonly settings$: Observable<Settings> = this.settingsSource$.pipe(
    switchMap(() => from(getSettings())),
    shareReplay(1)
  );

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

    if (!isUndefined(newSettings.syncStorage)) {
      const { sync, local } = chrome.storage;
      const source: StorageArea = !newSettings.syncStorage ? sync : local;
      const target: StorageArea = !newSettings.syncStorage ? local : sync;

      await copyStorage(source, target);

      if (source === sync) {
        sync.clear();
      }
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
}
