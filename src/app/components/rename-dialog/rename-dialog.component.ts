import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Field, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { TranslatePipe } from '../../pipes/translate.pipe';
import type { BrowserTab } from '../../utils/models';

/**
 * Rename form
 */
interface RenameModel {
  title: string;
  url: string;
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
  imports: [
    Field,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
})
export class RenameDialogComponent implements OnInit {
  readonly #dialogRef = inject<MatDialogRef<RenameDialogComponent, BrowserTab>>(MatDialogRef);
  readonly #tab = inject<BrowserTab>(MAT_DIALOG_DATA);

  readonly renameModel = signal<RenameModel>({
    title: '',
    url: '',
  });

  readonly renameForm = form(this.renameModel, (schemaPath) => {
    required(schemaPath.title);
    required(schemaPath.url);
  });

  ngOnInit() {
    this.renameForm.title().value.set(this.#tab.title);
    this.renameForm.url().value.set(this.#tab.url);
  }

  save(event: Event): void {
    event.preventDefault();

    const { title, url } = this.renameModel();
    this.#dialogRef.close({
      ...this.#tab,
      title,
      url,
    });
  }
}
