import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { shareReplay } from 'rxjs';
import { StickyDirective } from 'src/app/directives';
import { NavService } from '../../services/index';
import { routeAnimations, scrollTop } from '../../utils/index';
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
  animations: [routeAnimations],
  imports: [CommonModule, RouterOutlet, SearchFormComponent, StickyDirective],
})
export class PopupComponent {
  readonly urlChanges$ = this.navService.pathChanges$.pipe(shareReplay(1));

  constructor(private readonly navService: NavService) {}

  async navigate(...commands: string[]) {
    await this.navService.navigate(['/popup', ...commands]);
    scrollTop();
  }
}
