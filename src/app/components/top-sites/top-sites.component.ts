import { ChangeDetectionStrategy, Component, inject, input, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRipple } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { lastValueFrom } from 'rxjs';

import { StopPropagationDirective } from '../../directives';
import { FaviconPipe } from '../../pipes';
import { MessageService, SettingsService } from '../../services';
import { ActionIcon, TopSite, TopSites, translate } from '../../utils';
import { ImageComponent } from '../image/image.component';

/**
 * @description
 *
 * Top Sites expansion panel
 */
@Component({
  selector: 'nc-top-sites',
  templateUrl: './top-sites.component.html',
  styleUrl: './top-sites.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [FaviconPipe, ImageComponent, MatButtonModule, MatIconModule, MatRipple, StopPropagationDirective],
})
export class TopSitesComponent {
  readonly #message = inject(MessageService);
  readonly #settings = inject(SettingsService);

  readonly topSites = input<TopSites>();

  /**
   * Removes site from the list for top sites by ignoring it from the settings config
   */
  async removeSite(site: TopSite) {
    await this.#settings.ignoreSite({
      title: site.title,
      url: site.url,
    });

    const ref = this.#message.open(translate('siteMovedToIgnoreList'), ActionIcon.Settings, 'settings');
    const { dismissedByAction } = await lastValueFrom(ref.afterDismissed());

    if (dismissedByAction) {
      await chrome.runtime.openOptionsPage();
    }
  }
}
