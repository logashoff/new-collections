import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { TabService } from '../../services/index';
import { Action, ActionIcon, CollectionActions, Timeline } from '../../utils/index';
import { EmptyComponent } from '../empty/empty.component';
import { TimelineComponent } from '../timeline/timeline.component';

/**
 * @description
 *
 * Content component for extension popup that renders stored tab groups data.
 */
@Component({
  selector: 'app-popup-content',
  templateUrl: './popup-content.component.html',
  styleUrl: './popup-content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, EmptyComponent, TimelineComponent],
})
export class PopupContentComponent {
  readonly defaultActions: CollectionActions = [
    {
      action: Action.Save,
      icon: ActionIcon.Save,
      label: 'addCollection',
      color: 'primary',
    },
  ];

  /**
   * Tab groups grouped by time
   */
  readonly groupsTimeline$: Observable<Timeline>;

  constructor(private tabsService: TabService) {
    this.groupsTimeline$ = this.tabsService.groupsTimeline$;
  }
}
