import { ChangeDetectionStrategy, Component, input, output, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DataTestIdDirective, StopPropagationDirective } from '../../directives';
import { DatePipe, TranslatePipe } from '../../pipes';
import { Action, GroupActions } from '../../utils';

/**
 * @description
 *
 * Panel header controls container.
 */
@Component({
  selector: 'nc-group-controls',
  templateUrl: './group-controls.component.html',
  styleUrl: './group-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    DataTestIdDirective,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    StopPropagationDirective,
    TranslatePipe,
  ],
})
export class GroupControlsComponent {
  readonly timestamp = input<number>();
  readonly actions = input<GroupActions>();
  readonly clicked = output<Action>();
}
