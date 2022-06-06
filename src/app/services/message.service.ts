import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MessageComponent } from '../modules/shared';
import { ActionIcon } from '../utils';

/**
 * @description
 *
 * Service for displaying SnackBar message
 */
@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private snackBar: MatSnackBar) {}

  /**
   * Displays snackbar message
   */
  open(message: string, actionIcon?: ActionIcon, config: MatSnackBarConfig = {}) {
    return this.snackBar.openFromComponent(MessageComponent, {
      duration: 10_000,
      ...config,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: 'message-container',
      data: {
        actionIcon,
        message,
      },
    });
  }
}
