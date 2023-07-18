import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { HostnameGroup, trackByIcons } from 'src/app/utils';

@Component({
  selector: 'app-icons-container',
  templateUrl: './icons-container.component.html',
  styleUrls: ['./icons-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class IconsContainerComponent {
  @Input() icons: HostnameGroup;

  /**
   * Track icons by icon count.
   */
  readonly trackByIcons = trackByIcons;

  /**
   * Max number of icons should be displayed in panel header.
   */
  readonly maxIconsLength = 7;
}
