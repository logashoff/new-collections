import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { MessageComponent } from '../components';
import { ActionIcon, LocaleMessage } from '../utils';

/**
 * @description
 *
 * Service for displaying SnackBar message
 */
@Injectable({
  providedIn: 'root',
})
export class MessageService {
  readonly #snackBar = inject(MatSnackBar);

  /**
   * Displays snackbar message
   */
  open(message: string, actionIcon?: ActionIcon, actionLabel?: LocaleMessage, config: MatSnackBarConfig = {}) {
    return this.#snackBar.openFromComponent(MessageComponent, {
      duration: 10_000,
      ...config,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: 'message-container',
      data: {
        actionIcon,
        actionLabel,
        message,
      },
    });
  }
}
