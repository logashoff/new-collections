import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
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
  imports: [FaviconPipe, ImageComponent, MatButtonModule, MatIconModule, StopPropagationDirective],
})
export class TopSitesComponent {
  readonly topSites = input<TopSites>();

  constructor(
    private message: MessageService,
    private settings: SettingsService
  ) {}

  /**
   * Removes site from the list for top sites by ignoring it from the settings config
   */
  async removeSite(site: TopSite) {
    await this.settings.ignoreSite({
      title: site.title,
      url: site.url,
    });

    const ref = this.message.open(translate('siteMovedToIgnoreList'), ActionIcon.Settings);
    const { dismissedByAction } = await lastValueFrom(ref.afterDismissed());

    if (dismissedByAction) {
      chrome.runtime.openOptionsPage();
    }
  }
}
