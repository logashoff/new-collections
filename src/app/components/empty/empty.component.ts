import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { HtmlPipe } from '../../pipes/html.pipe';
import { CollectionsService } from '../../services';
import { Action, CollectionActions } from '../../utils';

/**
 * @description
 *
 * Component is rendered when there is tab groups data.
 */
@Component({
  selector: 'nc-empty',
  templateUrl: './empty.component.html',
  styleUrl: './empty.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [HtmlPipe, MatButtonModule, MatIconModule],
})
export class EmptyComponent {
  readonly actions = input<CollectionActions>();
  readonly message = input<string>();

  constructor(private collectionsService: CollectionsService) {}

  handleAction(action: Action) {
    this.collectionsService.handleAction(action);
  }
}
