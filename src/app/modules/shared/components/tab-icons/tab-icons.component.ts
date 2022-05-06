import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BehaviorSubject, map, Observable, shareReplay } from 'rxjs';
import { Domain, TabGroup } from 'src/app/utils';

/**
 * Max number of icons should be displayed in panel header.
 */
export const maxIconsLength = 7;

/**
 * @description
 *
 * Group of icons displayed in panel header.
 */
@Component({
  selector: 'app-tab-icons',
  templateUrl: './tab-icons.component.html',
  styleUrls: ['./tab-icons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabIconsComponent {
  private readonly group$ = new BehaviorSubject<TabGroup>(null);

  /**
   * Tab group.
   */
  @Input() set group(value: TabGroup) {
    this.group$.next(value);
  }

  get group(): TabGroup {
    return this.group$.value;
  }

  /**
   * Display number when max icon length is exceeded.
   */
  readonly overflowCount$: Observable<number> = this.group$.pipe(
    map((group) => (group.domains.length > maxIconsLength ? group.domains.length - maxIconsLength : 0)),
    shareReplay(1)
  );

  /**
   * Domain list with grouped domains displayed first.
   */
  readonly domainsList$: Observable<Domain[]> = this.group$.pipe(
    map((group) => group.domains.sort((a, b) => b.count - a.count).slice(0, maxIconsLength)),
    shareReplay(1)
  );
}
