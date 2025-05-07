import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TranslatePipe } from '../../pipes';
import { ActionIcon, LocaleMessage } from '../../utils';

interface MessageData {
  actionIcon?: ActionIcon;
  actionLabel?: LocaleMessage;
  message: string;
}

/**
 * @description
 *
 * Custom MatSnackBar component
 */
@Component({
  selector: 'nc-message',
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, TranslatePipe],
})
export class MessageComponent {
  readonly data = inject<MessageData>(MAT_SNACK_BAR_DATA);
  readonly #snackBarRef = inject<MatSnackBarRef<MessageComponent>>(MatSnackBarRef);

  dismissWithAction() {
    this.#snackBarRef.dismissWithAction();
  }

  dismiss() {
    this.#snackBarRef.dismiss();
  }
}
