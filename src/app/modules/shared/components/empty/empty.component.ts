import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { MenuService } from 'src/app/services';
import { Action, CollectionActions } from 'src/app/utils';

/**
 * @description
 *
 * Component is rendered when there is tab groups data.
 */
@Component({
  selector: 'app-empty',
  templateUrl: './empty.component.html',
  styleUrls: ['./empty.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class EmptyComponent {

  @Input() actions: CollectionActions;

  constructor(private menuService: MenuService) {}

  handleAction(action: Action) {
    this.menuService.handleMenuAction(action);
  }
}
