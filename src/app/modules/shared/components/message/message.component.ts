import { Component, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
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
