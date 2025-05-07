import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { shareReplay, take } from 'rxjs';

import { TranslatePipe } from '../../pipes';
import { CollectionsService, SettingsService } from '../../services';
import { Action, ActionIcon, CollectionActions, MostVisitedURL, translate } from '../../utils';

/**
 * Options form.
 */
interface OptionsForm {
  /**
   * Show/hide synced devices on new tab page.
   */
  enableDevices: FormControl<boolean>;

  /**
   * Show/hide top site on new tab page.
   */
  enableTopSites: FormControl<boolean>;

  /**
   * List of site to hide from top sites list.
   */
  ignoreTopSites: FormArray<FormControl<MostVisitedURL>>;

  /**
   * Use synced storage Chrome feature.
   */
  syncStorage: FormControl<boolean>;
}

/**
 * @description
 *
 * Extension Options page.
 */
@Component({
  selector: 'nc-options',
  templateUrl: './options.component.html',
  styleUrl: './options.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    DecimalPipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatTooltipModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
})
export class OptionsComponent implements OnInit {
  readonly #collectionsService = inject(CollectionsService);
  readonly #settings = inject(SettingsService);

  readonly collectionActions: CollectionActions = [
    {
      action: Action.Export,
      color: 'primary',
      icon: ActionIcon.Export,
      label: translate('export'),
      tooltip: translate('exportCollections'),
    },
    {
      action: Action.Import,
      icon: ActionIcon.Import,
      label: translate('import'),
      tooltip: translate('importCollections'),
    },
  ];

  readonly #devicesControl = new FormControl<boolean>(true);
  readonly sitesControl = new FormControl<boolean>(true);
  readonly syncStorage = new FormControl<boolean>(true);
  readonly ignoreSitesControl = new FormArray<FormControl<MostVisitedURL>>([]);

  /**
   * Sync storage used
   */
  readonly #storageUsageSource = signal<number>(0);

  /**
   * Chrome sync storage has limited quota (~100KB), this will show how much storage is currently inuse.
   */
  readonly storageUsage = computed<number>(() => (this.#storageUsageSource() / chrome.storage.sync.QUOTA_BYTES) * 100);

  readonly formGroup = new FormGroup<OptionsForm>({
    enableDevices: this.#devicesControl,
    enableTopSites: this.sitesControl,
    ignoreTopSites: this.ignoreSitesControl,
    syncStorage: this.syncStorage,
  });

  readonly #formValues$ = this.formGroup.valueChanges.pipe(takeUntilDestroyed(), shareReplay(1));

  async ngOnInit() {
    this.#storageUsageSource.set(await this.#settings.getUsageBytes());

    this.#settings.settings$.pipe(take(1)).subscribe((settings) => {
      if (settings) {
        if (typeof settings.enableTopSites === 'undefined') {
          settings.enableTopSites = true;
        }

        this.sitesControl.setValue(settings.enableTopSites);

        if (typeof settings.syncStorage === 'undefined') {
          settings.syncStorage = true;
        }

        this.syncStorage.setValue(settings.syncStorage);

        if (typeof settings.enableDevices === 'undefined') {
          settings.enableDevices = true;
        }

        this.#devicesControl.setValue(settings.enableDevices);

        if (settings.ignoreTopSites?.length > 0) {
          settings.ignoreTopSites.forEach((site) => this.ignoreSitesControl.push(new FormControl(site)));
        }
      }

      this.#formValues$.subscribe(async (settings) => {
        await this.#settings.update(settings);

        const storageBytes = await this.#settings.getUsageBytes();
        this.#storageUsageSource.set(storageBytes);
      });
    });
  }

  handleAction(action: Action) {
    this.#collectionsService.handleAction(action);
  }
}
