import { ChangeDetectionStrategy, Component, inject, input, ViewEncapsulation } from '@angular/core';
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
  imports: [HtmlPipe, MatButtonModule, MatIconModule],
})
export class EmptyComponent {
  readonly #collectionsService = inject(CollectionsService);

  readonly actions = input<CollectionActions>();
  readonly message = input<string>();

  handleAction(action: Action) {
    this.#collectionsService.handleAction(action);
  }
}
