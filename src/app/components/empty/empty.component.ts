import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CollectionsService } from '../../services/index';
import { Action, CollectionActions, translate } from '../../utils/index';

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
  imports: [MatButtonModule, MatIconModule],
})
export class EmptyComponent {
  readonly translate = translate;

  readonly actions = input<CollectionActions>();

  constructor(private collectionsService: CollectionsService) {}

  handleAction(action: Action) {
    this.collectionsService.handleAction(action);
  }
}
