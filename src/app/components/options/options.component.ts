import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { take } from 'rxjs';
import { FormField, form } from '@angular/forms/signals';

import { TranslatePipe } from '../../pipes';
import { CollectionsService, SettingsService } from '../../services';
import { Action, ActionIcon, CollectionActions, MostVisitedURL, translate } from '../../utils';

/**
 * Options form.
 */
interface OptionsModel {
  /**
   * Show/hide synced devices on new tab page.
   */
  enableDevices: boolean;

  /**
   * Show/hide top site on new tab page.
   */
  enableTopSites: boolean;

  /**
   * List of site to hide from top sites list.
   */
  ignoreTopSites: MostVisitedURL[];

  /**
   * Use synced storage Chrome feature.
   */
  syncStorage: boolean;
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
    FormField,
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

  /**
   * Sync storage used
   */
  readonly #storageUsageSource = signal<number>(0);

  /**
   * Chrome sync storage has limited quota (~100KB), this will show how much storage is currently inuse.
   */
  readonly storageUsage = computed<number>(() => (this.#storageUsageSource() / chrome.storage.sync.QUOTA_BYTES) * 100);

  readonly optionsModel = signal<OptionsModel>({
    enableDevices: false,
    enableTopSites: false,
    ignoreTopSites: [],
    syncStorage: false,
  });

  readonly optionsForm = form(this.optionsModel);

  constructor() {
    effect(async () => {
      await this.#settings.update(this.optionsModel());

      const storageBytes = await this.#settings.getUsageBytes();
      this.#storageUsageSource.set(storageBytes);
    });
  }

  async ngOnInit() {
    this.#storageUsageSource.set(await this.#settings.getUsageBytes());

    this.#settings.settings$.pipe(take(1)).subscribe((settings) => {
      if (settings) {
        if (typeof settings.enableTopSites === 'undefined') {
          settings.enableTopSites = true;
        }

        this.optionsForm.enableTopSites().value.set(settings.enableTopSites);

        if (typeof settings.syncStorage === 'undefined') {
          settings.syncStorage = true;
        }

        this.optionsForm.syncStorage().value.set(settings.syncStorage);

        if (typeof settings.enableDevices === 'undefined') {
          settings.enableDevices = true;
        }

        this.optionsForm.enableDevices().value.set(settings.enableDevices);

        if (settings.ignoreTopSites?.length > 0) {
          this.optionsForm.ignoreTopSites().value.set(settings.ignoreTopSites);
        }
      }
    });
  }

  handleAction(action: Action) {
    void this.#collectionsService.handleAction(action);
  }

  removeSiteAt(index = 0) {
    const sites = this.optionsModel().ignoreTopSites;
    sites.splice(index, 1);
    this.optionsForm.ignoreTopSites().value.set(sites);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
  }
}
