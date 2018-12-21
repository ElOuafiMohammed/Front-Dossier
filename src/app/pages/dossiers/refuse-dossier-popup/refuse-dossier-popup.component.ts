import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { minSearchLength } from 'app/shared/methodes-generiques';
import { getErrorMessage, snackbarConfigError } from 'app/shared/shared.retourApi';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NatureRefus, RefusDossier } from '../refuse-dossier-popup/refuse-dossier-popup.interface';
import { ComponentViewRightMode, DossierService } from './../dossiers.service';


/**
 * Component that refuses SIGA Dossiers
 */
@Component({
  templateUrl: './refuse-dossier-popup.component.html',
  styleUrls: ['./refuse-dossier-popup.component.scss'],
})
export class RefuseDossierPopupComponent extends ComponentViewRightMode implements OnInit, OnDestroy {
  /**
   * The object reprensenting the refus Dossier
   */
  formRefus: FormGroup;

  private unsubscribe = new Subject<void>();
  natures: NatureRefus[] = null;
  filteredNatures: Observable<NatureRefus[]>;
  readonly natureValidatorKey = 'natureNotFound';
  get natureControl() { return this.formRefus.get('nature'); }
  get motifControl() { return this.formRefus.get('motif'); }

  /**
   * Used to avoid multi-click from the user
   */
  submitted = false;

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  /**
  * Component dependencies
  * @param _formBuilder used to create the form
  * @param _snackbar message that confirm the refuse of dossier
  * @param dialogRef used to display the popup
  * @param dossierService used to manage dossiers
  * @param _changeDetector triggers Angular change detection
  */
  constructor(
    private _formBuilder: FormBuilder,
    private _snackbar: MatSnackBar,
    public dialogRef: MatDialogRef<RefuseDossierPopupComponent>,
    public dossierService: DossierService,
    private _changeDetector: ChangeDetectorRef,
    public translate: TranslateService
  ) {
    super(dossierService);
  }

  /**
   * Initializes the form and the specific inputs
   */
  ngOnInit() {
    // Init empty object instead of null for the form
    const refusDossier = this.dossierService.dossier.refusDossier;
    if (!refusDossier) {
      this.dossierService.dossier.refusDossier = {
        motifRefus: '',
        natureRefus: null
      };
    }

    this.formRefus = this._formBuilder.group({
      nature: [this.viewRight ? this.dossierService.dossier.refusDossier.natureRefus : '', [Validators.required]],
      motif: [this.viewRight ? this.dossierService.dossier.refusDossier.motifRefus : '', [Validators.required, Validators.maxLength(240)]]
    });

    if (this.viewRight) {
      this.formRefus.disable();
    }

    // setTimeout(() => {
    this.natures = this.dossierService.getNatureRefus()
    // Set synchronous validator once the data is available
    GeneriqueListValeur.sigaAutocompleteValidatorFactory(this.natures, this.natureValidatorKey)
    this.filteredNatures = GeneriqueListValeur.filtringList(this.natures, this.natureControl, this.natureValidatorKey, minSearchLength, 'listValeur');
    // }, this.dossierService.delay);
  }

  /**
  * Manages how a nature should be displayed in the input
  * @param nature a given nature to be formatted
  */
  displayNature(nature: NatureRefus) {
    if (nature) {
      return `${nature.libelle}`;
    }
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  /**
  * Add line on key Enter
  * @param $event event
  * @param oField textAreaText
  * TODO : Add event type
  */
  addLine($event: any, oField: any) {
    if ((oField.selectionStart || oField.selectionStart === '0') && $event.keyCode === 13) {
      const content = this.motifControl.value as string;
      this.motifControl.setValue(content.substring(0, oField.selectionStart) + '\n' +
        content.substring(oField.selectionStart, content.length));
    }
  }

  onSubmit() {
    this.submitted = true;
    const refusDossier: RefusDossier = {
      motifRefus: (this.motifControl.value as string),
      natureRefus: (this.natureControl.value as NatureRefus)
    };

    this.dossierService.refuseDossier(this.dossierService.dossier.id, refusDossier)
      .subscribe((dossier) => {
        // Done this way to pass through the service setter and trigger the subject
        this.dossierService.dossier = dossier;
        this.dossierService.preDossier = Object.assign({}, dossier.preDossier);
        this.dossierService.dossierFinancier = Object.assign({}, dossier.dossierFinancier);

        this.dialogRef.close(true);
      },
        (error: HttpErrorResponse) => {
          const snackMessage = getErrorMessage(error, `Le refus du dossier a échoué. Contacter l'administrateur.`);
          const snackbarRef = this._snackbar.open(snackMessage, 'X', snackbarConfigError);
          snackbarRef.afterDismissed().pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
              console.error(error);
              this.submitted = false;
              this._changeDetector.detectChanges();
            });
        });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
