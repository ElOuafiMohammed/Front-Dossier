import { HttpErrorResponse } from "@angular/common/http";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogConfig, MatDialogRef } from "@angular/material";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { SearchPopupInterlocuteurComponent } from "../../../../../../shared/search-popup/search-popup-interlocuteur.component";
import { getErrorMessage } from "../../../../../../shared/shared.retourApi";
import { BenefRegex, Interlocuteur } from "../../../../dossiers.interface";
import { DossierService } from "../../../../dossiers.service";
import { Correspondant } from "../../correspondant.interface";

@Component({
  selector: "siga-input-reference-interlocuteur",
  templateUrl: "./input-reference-interlocuteur.component.html",
  styleUrls: ["./input-reference-interlocuteur.component.scss"]
})
export class InputReferenceInterlocuteurComponent implements OnInit {
  /**
   * Input value
   */
  public value: string;

  /**
   * Exception handler if interlocuteur does not exist
   */
  message: string;

  public static inputFromSearch: Subject<string> = new Subject<string>();

  /**
   * Date of row
   */
  @Input() rowData: Correspondant;

  /**
   * Output event of update ouvrage
   */
  @Output() updateCorrespondantEvent: EventEmitter<any> = new EventEmitter();

  /**
   * Notify erreur on email and phone number
   */
  @Output() notifyCheckParentComponent: EventEmitter<any> = new EventEmitter();

  /**
   * Form group
   */
  formCorrespondant: FormGroup;

  private unsubscribe = new Subject<void>();

  get referenceCorrespControl() {
    return this.formCorrespondant.get("referenceCorresp");
  }

  constructor(
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    private dossierService: DossierService
  ) {}

  ngOnInit() {
    if (this.rowData) {
      this.value = this.rowData.referenceCorresp;
    }

    this.formCorrespondant = this._formBuilder.group({
      referenceCorresp: [
        null,
        [
          Validators.required,
          Validators.maxLength(9),
          Validators.pattern(BenefRegex)
        ]
      ]
    });
  }
  onBlur() {
    this.message = null;
    const valeurChamp = this.formCorrespondant.get("referenceCorresp").value;

    if (valeurChamp) {
      const benef_number = (this.referenceCorrespControl
        .value as string).toUpperCase();
      if (this.referenceCorrespControl.valid) {
        this.dossierService.getBeneficaire(benef_number).subscribe(
          (interlocuteurResult: any) => {
            this.rowData.correspondant = interlocuteurResult;
            this.rowData.referenceCorresp = interlocuteurResult.reference;
            this.updateCorrespondantEvent.emit(this.rowData);
            this.notifyCheckParentComponent.emit(
              this.referenceCorrespControl.valid
            );
          },
          (error: HttpErrorResponse) => {
            this.referenceCorrespControl.setErrors({ benefNotFound: true });
            this.message = getErrorMessage(error);
            this.notifyCheckParentComponent.emit(false);
          }
        );
      } else {
        this.rowData.correspondant.raisonSociale = null;
        this.notifyCheckParentComponent.emit(false);
      }
    } else {
      this.rowData.correspondant.raisonSociale = null;
      this.notifyCheckParentComponent.emit(false);
    }
  }
  /**
   * Search interlocuteur
   */
  searchInterlocuteur(row: Correspondant) {
    const matDialogRef = this.openSearchInterlocuteurDialog();

    matDialogRef
      .beforeClose()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((result: boolean) => {
        if (result) {
          this.referenceCorrespControl.markAsPristine();
        }
      });
    matDialogRef.afterClosed().subscribe(res => {
      if (res === false) {
        this.referenceCorrespControl.setValue(
          matDialogRef.componentInstance.data.beneficiaire.reference
        );
        const interlocuteurSearch: Interlocuteur =
          matDialogRef.componentInstance.data.beneficiaire;
        const correspondantSearch: Correspondant = null;
        this.value = interlocuteurSearch.reference;
        this.rowData.referenceCorresp = this.value;
        this.updateCorrespondantEvent.emit(this.rowData);
        this.notifyCheckParentComponent.emit(
          this.referenceCorrespControl.valid
        );
      }
    });
  }
  openSearchInterlocuteurDialog(): MatDialogRef<
    SearchPopupInterlocuteurComponent
  > {
    const config = new MatDialogConfig();
    config.width = "90%";
    config.disableClose = true;
    config.autoFocus = false;
    config.data = { title: "Recherche Interlocuteur" };
    return this.dialog.open(SearchPopupInterlocuteurComponent, config);
  }
}
