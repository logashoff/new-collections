import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserTab } from 'src/app/utils';

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
  styleUrls: ['./rename-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
