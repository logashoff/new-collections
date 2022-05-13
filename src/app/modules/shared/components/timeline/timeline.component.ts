import { Component, Input } from '@angular/core';
import { isNil } from 'lodash';
import { BehaviorSubject, filter, map, Observable, shareReplay } from 'rxjs';
import { Timeline } from 'src/app/utils';

/**
 * @description
 *
 * Displays tab groups separated by time.
 */
@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent {
  private readonly timeline$ = new BehaviorSubject<Timeline>(null);

  /**
   * Tab groups grouped by time
   */
  @Input() set timeline(value: Timeline) {
    this.timeline$.next(value);
  }

  get timeline(): Timeline {
    return this.timeline$.value;
  }

  readonly timelineLabels$: Observable<string[]> = this.timeline$.pipe(
    filter((timeline) => !isNil(timeline)),
    map((timeline) => Object.keys(timeline)),
    shareReplay(1)
  );
}
