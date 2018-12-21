import { AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Beneficiaire } from 'app/pages/dossiers/create-dossier/create-dossier.interface';

import { SearchPopupInterlocuteurComponent } from './search-popup/search-popup-interlocuteur.component';


export default class BeneficiaireHandler {

  /**
  * Open popup of search  beneficiary
  */
  static searchBeneficiary(submitted: boolean, benefLibelleControl: AbstractControl, benefNumberControl: AbstractControl, beneficiaire: Beneficiaire, dialog: MatDialog) {
    submitted = true;
    const matDialogRef = this.openSearchBeneficiaryDialog(beneficiaire, dialog);

    matDialogRef.beforeClose()
      .subscribe(
        (result: boolean) => {
          if (result) {
            benefLibelleControl.markAsPristine();
          }
        });

    matDialogRef.afterClosed().subscribe(
      res => {
        if (res === false) {
          benefNumberControl.setValue(matDialogRef.componentInstance.data.beneficiaire.reference);
          benefLibelleControl.markAsDirty();
        }
      }
    );

    matDialogRef.afterClosed()
      .subscribe(() => {
        submitted = false;
      });
  }


  /**
     * Configures Material Dialog of search beneficiary
     */
  static openSearchBeneficiaryDialog(beneficiaire: Beneficiaire, dialog: MatDialog): MatDialogRef<SearchPopupInterlocuteurComponent> {
    const config = new MatDialogConfig();
    config.width = '90%';
    config.disableClose = true;
    config.autoFocus = false;
    config.data = { beneficiaire: beneficiaire, title: 'Recherche Bénéficiaire' };
    return dialog.open(SearchPopupInterlocuteurComponent, config);
  }
}


