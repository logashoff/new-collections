import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { isNil } from 'lodash';
import { BehaviorSubject, combineLatest, filter, map, Observable, shareReplay } from 'rxjs';
import { BrowserTab, Domain, getHostname } from 'src/app/utils';

/**
 * @description
 *
 * Tab icon displayed in panel header.
 */
@Component({
  selector: 'app-tab-icon',
  templateUrl: './tab-icon.component.html',
  styleUrls: ['./tab-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabIconComponent {
  private readonly domain$ = new BehaviorSubject<Domain>(null);

  /**
   * Domain data.
   */
  @Input() set domain(value: Domain) {
    this.domain$.next(value);
  }

  get domain(): Domain {
    return this.domain$.value;
  }

  /**
   * Displays text next to icon.
   */
  @Input() showLabel = false;

  private readonly tabs$ = new BehaviorSubject<BrowserTab[]>([]);

  /**
   * Tabs list.
   */
  @Input() set tabs(value: BrowserTab[]) {
    this.tabs$.next(value);
  }

  get tabs(): BrowserTab[] {
    return this.tabs$.value;
  }

  /**
   * Returns tab title based on `domain`
   */
  readonly label$: Observable<string> = combineLatest([this.tabs$, this.domain$]).pipe(
    filter(([tabs, domain]) => tabs.length > 0 && !isNil(domain)),
    map(([tabs, domain]) => {
      const { name: hostName } = domain;
      const tab: BrowserTab = tabs.find((tab) => getHostname(tab) === hostName);

      return tab?.title ?? hostName;
    }),
    shareReplay(1)
  );
}
