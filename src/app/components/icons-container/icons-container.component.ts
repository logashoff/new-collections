import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { HostnameGroup } from '../../utils';

import { FaviconPipe } from '../../pipes';
import { ChipComponent } from '../chip/chip.component';

@Component({
  selector: 'nc-icons-container',
  templateUrl: './icons-container.component.html',
  styleUrl: './icons-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [ChipComponent, FaviconPipe, MatBadgeModule],
})
export class IconsContainerComponent {
  readonly icons = input<HostnameGroup>();

  /**
   * Max number of icons should be displayed in panel header.
   */
  readonly maxIconsLength = 7;
}
