import { ChangeDetectionStrategy, Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActionIcon, translate } from '../../utils/index';

/**
 * @description
 *
 * Custom MatSnackBar component
 */
@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
})
export class MessageComponent {
  readonly translate = translate;

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) readonly data: { message: string; actionIcon: ActionIcon },
    private snackBarRef: MatSnackBarRef<MessageComponent>
  ) {}

  dismissWithAction() {
    this.snackBarRef.dismissWithAction();
  }

  dismiss() {
    this.snackBarRef.dismiss();
  }
}
