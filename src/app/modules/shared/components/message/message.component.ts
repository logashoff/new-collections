import { ChangeDetectionStrategy, Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { ActionIcon } from 'src/app/utils';

/**
 * @description
 *
 * Custom MatSnackBar component
 */
@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MessageComponent {
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
