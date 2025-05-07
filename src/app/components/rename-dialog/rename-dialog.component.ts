import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { TranslatePipe } from '../../pipes';
import { BrowserTab } from '../../utils';

/**
 * Rename form
 */
interface RenameForm {
  title: FormControl<string>;
  url: FormControl<string>;
}

/**
 * @description
 *
 * Popup modal dialog for renaming tab title.
 */
@Component({
  selector: 'nc-rename-dialog',
  templateUrl: './rename-dialog.component.html',
  styleUrl: './rename-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, TranslatePipe],
})
export class RenameDialogComponent implements OnInit {
  readonly #dialogRef = inject<MatDialogRef<RenameDialogComponent, BrowserTab>>(MatDialogRef);
  readonly #tab = inject<BrowserTab>(MAT_DIALOG_DATA);

  formGroup: FormGroup<RenameForm>;

  ngOnInit(): void {
    this.formGroup = new FormGroup<RenameForm>({
      title: new FormControl<string>(this.#tab.title, Validators.required),
      url: new FormControl<string>(this.#tab.url, Validators.required),
    });
  }

  save(): void {
    const { title, url } = this.formGroup.value;
    this.#dialogRef.close({
      ...this.#tab,
      title,
      url,
    });
  }
}
