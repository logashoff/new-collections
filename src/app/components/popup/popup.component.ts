import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { shareReplay } from 'rxjs';
import { NavService } from '../../services';
import { routeAnimations, scrollTop } from '../../utils';
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
  imports: [CommonModule, RouterOutlet, SearchFormComponent],
})
export class PopupComponent {
  readonly urlChanges$ = this.navService.pathChanges$.pipe(shareReplay(1));

  constructor(private readonly navService: NavService) {}

  async navigate(...commands: string[]) {
    await this.navService.navigate(['/popup', ...commands]);
    scrollTop();
  }
}
