import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

/**
 * OK / KO standard popup used for navigation events after something got done on the current screen.
 */
@Component({
  templateUrl: './confirm-popup.component.html',
  styleUrls: ['./confirm-popup.component.scss'],
})
export class ConfirmPopupComponent {

  /**
   * Variable to store the save icon during a warning
   */
  imageIconSaveWarning = 'assets/img/savelogobis.jpg';
  tooltipValue: string;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ConfirmPopupComponent>,
  ) { }

  /**
   * onCancel: Stay on the page without save the changes
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * onLeave: Leave page without save the changes
   */
  onLeave(): void {
    this.dialogRef.close(true);
  }

  /**
   * onSave: Save the changes and leave the page
   */
  onSave(): void {
    this.dialogRef.close('save');
  }

  /**
  * Change the background color of the save button symbolizing the focus or not
  */
  styleFocusSave() {
    let style;
    if (this.data.valueStatusError === true) {
      style = { 'background-color': '' };
    } else {
      style = { 'background-color': 'rgb(32,158,145)' };
    }
    return style;
  }

  /**
   * Store value of tooltip
   */
  tooltipChangeValue() {
    if (this.data.valueStatusError !== true) {
      this.tooltipValue = ''
    } else {
      this.tooltipValue = 'Vous devez corriger les erreurs pour pouvoir enregistrer.';
    }
  }

  /**
   * Change the background color of the cancel button symbolizing the focus or not
   */
  styleFocusCancel() {
    this.tooltipChangeValue();
    let myStyle
    if (this.data.typeAction === 'update' && this.data.valueStatusError !== true) {
      myStyle = { 'background-color': 'white' }
    } else {
      myStyle = { 'background-color': 'rgb(32,158,145)' }
    }
    return myStyle;
  }

}
