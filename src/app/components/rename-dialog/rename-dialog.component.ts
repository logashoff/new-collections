import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserTab } from '../../utils/index';

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
  selector: 'app-rename-dialog',
  templateUrl: './rename-dialog.component.html',
  styleUrl: './rename-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, TranslateModule],
})
export class RenameDialogComponent implements OnInit {
  formGroup: FormGroup<RenameForm>;

  constructor(
    public dialogRef: MatDialogRef<RenameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private tab: BrowserTab
  ) {}

  ngOnInit(): void {
    this.formGroup = new FormGroup<RenameForm>({
      title: new FormControl<string>(this.tab.title, Validators.required),
      url: new FormControl<string>(this.tab.url, Validators.required),
    });
  }

  save(): void {
    const { title, url } = this.formGroup.value;
    this.dialogRef.close({
      ...this.tab,
      title,
      url,
    });
  }
}
