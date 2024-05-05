import { ChangeDetectionStrategy, Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ActionIcon } from '../../utils/index';

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
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, TranslateModule],
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
