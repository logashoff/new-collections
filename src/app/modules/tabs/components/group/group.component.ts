import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TabGroup, TabService } from 'src/app/services';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupComponent {
  readonly group$ = new BehaviorSubject<TabGroup>(null);

  @Input() set group(group: TabGroup) {
    this.group$.next(group);
  }

  constructor(private tabService: TabService) {}

  removeTabs() {
    this.tabService.removeTabGroup(this.group$.value);
  }

  restoreTabs() {
    this.tabService.restoreTabs(this.group$.value);
  }
}
