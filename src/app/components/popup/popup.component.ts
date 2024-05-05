import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StickyDirective } from 'src/app/directives';
import { NavService } from '../../services/index';
import { scrollTop } from '../../utils/index';
import { SearchFormComponent } from '../search-form/search-form.component';

/**
 * @description
 *
 * Root component for extension popup that renders stored tab groups data.
 */
@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [RouterOutlet, SearchFormComponent, StickyDirective],
})
export class PopupComponent {
  constructor(private navService: NavService) {}

  async navigate(commands) {
    await this.navService.navigate(commands);
    scrollTop();
  }
}
