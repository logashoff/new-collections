import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { map, Observable, shareReplay } from 'rxjs';

import { KeyListenerDirective } from '../../directives';
import { KeyService, NavService, TabService } from '../../services';
import { scrollTop } from '../../utils';
import { SearchFormComponent } from '../search-form/search-form.component';

/**
 * @description
 *
 * Root component for extension popup that renders stored tab groups data.
 */
@Component({
  selector: 'nc-popup',
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [AsyncPipe, RouterOutlet, SearchFormComponent],
  providers: [KeyService],
})
export class PopupComponent extends KeyListenerDirective {
  readonly #navService = inject(NavService);
  readonly #tabService = inject(TabService);
  readonly hasData$: Observable<boolean> = this.#tabService.groupsTimeline$.pipe(
    map((timeline) => timeline?.length > 0),
    shareReplay(1)
  );

  async navigate(...commands: string[]) {
    await this.#navService.navigate(['/popup', ...commands]);
    scrollTop();
  }

  onBlur() {
    this.clearActive();
  }
}
