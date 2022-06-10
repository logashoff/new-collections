import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import isUndefined from 'lodash/isUndefined';
import { BehaviorSubject, map, Observable, shareReplay, startWith, take } from 'rxjs';
import { SettingsService } from 'src/app/services';

/**
 * @description
 *
 * Extension Options page.
 */
@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class OptionsComponent implements OnInit {
  private readonly devicesControl = new FormControl(true);
  private readonly sitesControl = new FormControl(true);
  readonly syncStorage = new FormControl(true);
  readonly ignoreSitesControl = new FormArray([]);

  /**
   * Sync storage used
   */
  private readonly storageUsageSource$ = new BehaviorSubject<number>(0);

  /**
   * Chrome sync storage has limited quota (~100KB), this will show how much storage is currently inuse.
   */
  readonly storageUsage$: Observable<number> = this.storageUsageSource$.pipe(
    startWith(0),
    map((usage) => (usage / chrome.storage.sync.QUOTA_BYTES) * 100),
    shareReplay(1)
  );

  readonly formGroup = new FormGroup({
    enableDevices: this.devicesControl,
    enableTopSites: this.sitesControl,
    ignoreTopSites: this.ignoreSitesControl,
    syncStorage: this.syncStorage,
  });

  constructor(private settings: SettingsService) {}

  async ngOnInit() {
    this.storageUsageSource$.next(await chrome.storage.sync.getBytesInUse());

    this.settings.settings$.pipe(take(1)).subscribe((settings) => {
      if (settings) {
        if (isUndefined(settings.enableTopSites)) {
          settings.enableTopSites = true;
        }

        this.sitesControl.setValue(settings.enableTopSites);

        if (isUndefined(settings.syncStorage)) {
          settings.syncStorage = true;
        }

        this.syncStorage.setValue(settings.syncStorage);

        if (isUndefined(settings.enableDevices)) {
          settings.enableDevices = true;
        }

        this.devicesControl.setValue(settings.enableDevices);

        if (settings.ignoreTopSites?.length > 0) {
          settings.ignoreTopSites.forEach((site) => this.ignoreSitesControl.push(new FormControl(site)));
        }
      }
    });

    this.formGroup.valueChanges.subscribe(async (settings) => {
      await this.settings.update(settings);

      if (settings.syncStorage) {
        this.storageUsageSource$.next(await chrome.storage.sync.getBytesInUse());
      }
    });
  }
}
