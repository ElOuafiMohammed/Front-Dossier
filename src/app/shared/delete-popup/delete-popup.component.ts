import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Operation } from 'app/pages/dossiers/dossier/dossier.interface';

@Component({
  templateUrl: './delete-popup.component.html',
  styleUrls: ['./delete-popup.component.scss'],
})
export class DeletePopupComponent {

  operation: Operation;

  constructor(
    public dialogRef: MatDialogRef<DeletePopupComponent>,
  ) { }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }
}
