import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, shareReplay, switchMap } from 'rxjs';
import { MostVisitedURL, Settings, settingsStorageKey } from '../utils';

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
    switchMap(() => from(this.getSettings())),
    shareReplay(1)
  );

  private saveSettings(settings: Settings): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [settingsStorageKey]: settings }, () => resolve());
    });
  }

  private getSettings(): Promise<Settings> {
    return new Promise((resolve) => {
      chrome.storage.local.get(settingsStorageKey, ({ settings }) => resolve(settings));
    });
  }

  /**
   * Updates and saves new settings
   */
  async update(settings: Settings) {
    const currentSettings = await this.getSettings();

    const newSettings = {
      ...currentSettings,
      ...settings,
    };

    this.saveSettings(newSettings);

    this.settingsSource$.next(newSettings);
  }

  /**
   * Updates ignore site list with new site specified
   */
  async ignoreSite(site: MostVisitedURL) {
    const settings = await this.getSettings();

    if (settings.ignoreTopSites?.length > 0) {
      settings.ignoreTopSites.push(site);
    } else {
      settings.ignoreTopSites = [site];
    }

    this.update(settings);
  }
}
