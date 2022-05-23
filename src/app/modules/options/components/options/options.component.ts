import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * @description
 *
 * Extension Options page.
 */
@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsComponent {}
