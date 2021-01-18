import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TabGroup } from 'src/app/services';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupsComponent {
  @Input() groups: TabGroup[];
}
