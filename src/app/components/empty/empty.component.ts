import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { CollectionsService } from '../../services/index';
import { Action, CollectionActions } from '../../utils/index';

/**
 * @description
 *
 * Component is rendered when there is tab groups data.
 */
@Component({
  selector: 'app-empty',
  templateUrl: './empty.component.html',
  styleUrl: './empty.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MatButtonModule, MatIconModule, TranslateModule],
})
export class EmptyComponent {
  @Input() actions: CollectionActions;

  constructor(private collectionsService: CollectionsService) {}

  handleAction(action: Action) {
    this.collectionsService.handleAction(action);
  }
}
