import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserTab } from 'src/app/utils';

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
  formGroup: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<RenameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private tab: BrowserTab
  ) {}

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      name: new FormControl(this.tab.title, Validators.required),
    });
  }

  save(): void {
    this.dialogRef.close(this.formGroup.value.name);
  }
}
