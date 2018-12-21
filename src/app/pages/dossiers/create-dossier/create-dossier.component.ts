import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmPopupComponent } from 'app/shared/confirm-popup/confirm-popup.component';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { GenericVariables } from 'app/shared/generic.variables';
import MethodeGenerique, { minSearchLength, SpinnerLuncher } from 'app/shared/methodes-generiques';
import BeneficiaireHandler from 'app/shared/shared.beneficiare';
import { getErrorMessage, snackbarConfigError, snackbarConfigSuccess } from 'app/shared/shared.retourApi';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { BenefRegex, Departements } from '../dossiers.interface';
import { DossierService } from './../dossiers.service';
import { DossierCreate, Thematique } from './create-dossier.interface';


/**
 * Component that creates SIGA dossiers
 */
@Component({
  selector: "siga-create-dossier",
  templateUrl: "./create-dossier.component.html",
  styleUrls: ["./create-dossier.component.scss"]
})
export class CreateDossierComponent extends GenericVariables
  implements OnInit, OnDestroy {
  /**
   * The object reprensenting the whole dossier to be created
   */
  formDossier: FormGroup;
  valueCloseDialog = false;
  /**
   * boolean that retrieves the state of the page when there are errors
   */
  pageHasError = false;

  get thematiqueControl() {
    return this.formDossier.get("thematique");
  }

  get deptControl() {
    return this.formDossier.get("dept");
  }

  get intituleControl() {
    return this.formDossier.get("intitule");
  }
  get benefNumberControl() {
    return this.formDossier.get("benef_number");
  }
  get benefLibelleControl() {
    return this.formDossier.get("benef_libelle");
  }

  snackbarSubscription: Subscription;

  private unsubscribe = new Subject<void>();

  /**
   * Exception handler if beneficaire does not exist
   */
  message: string;

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  /**
   * Component dependencies
   * @param dialog used to display the popup
   * @param _snackbar used to display snackbars
   * @param _formBuilder used to create the form
   * @param _router handle manual navigation
   * @param _dossierService used to manage dossiers
   * @param _changeDetector triggers Angular change detection
   */
  constructor(
    public dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _dossierService: DossierService,
    private _changeDetector: ChangeDetectorRef,
    public translate: TranslateService,
    private spinnerLuncher: SpinnerLuncher
  ) {
    super();
  }

  /**
   * Initializes the form and the specific inputs
   */
  ngOnInit() {
    this.formDossier = this._formBuilder.group({
      thematique: [null, [Validators.required]],
      dept: [null, [Validators.required]],
      intitule: [null, [Validators.required, Validators.maxLength(80)]],
      benef_number: [
        null,
        [
          Validators.required,
          Validators.maxLength(9),
          Validators.pattern(BenefRegex)
        ]
      ],
      benef_libelle: [{ value: null, disabled: true }, [Validators.required]]
    });

    if (this._dossierService.previousPage === "") {
      this._dossierService.previousPage = this._router.url;
    } else {
      this._dossierService.previousPage = this._dossierService.currentPage;
    }
    this._dossierService.currentPage = this._router.url;

    // Bénéficiaire libelle handler
    this.benefNumberControl.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((value: string) => {
        this.message = null;
        this.beneficiaire = null;

        // SIGA-3634 : suppression code IE
        // Sometimes IE AfterViewInit procs BEFORE this listenner for no reason
        // if (value === "") {
        //   if (this.benefNumberControl.dirty) {
        //     this.benefNumberControl.markAsPristine();
        //     this.benefNumberControl.markAsUntouched();
        //   }
        //   this.benefNumberControl.setValue(null, { emitEvent: false });
        // }

        // Forces the error state to appear (touched status) when there are enough numbers
        if (value && value.length === 9) {
          this.benefNumberControl.markAsTouched();
        }

        if (this.benefNumberControl.valid) {
          const benefNumber = (this.benefNumberControl
            .value as string).toUpperCase();
          this._dossierService.getBeneficaire(benefNumber).subscribe(
            beneficiaire => {
              this.beneficiaire = beneficiaire;
              this.benefLibelleControl.setValue(beneficiaire.raisonSociale);
              if (!beneficiaire.actif) {
                this.benefNumberControl.setErrors({ benefInactive: true });
              }
            },
            (error: HttpErrorResponse) => {
              this.benefNumberControl.setErrors({ benefNotFound: true });
              this.message = getErrorMessage(error);
              this.benefLibelleControl.setValue(null);
            }
          );
        } else {
          this.benefLibelleControl.setValue(null);
        }
      });

    // setTimeout(() => {
    this.thematiques = this._dossierService.getThematiques()
    if (this.formDossier && this.thematiques) {
      this.filteredThematiques = GeneriqueListValeur.filtringList(
        this.thematiques,
        this.thematiqueControl,
        this.thematiqueValidatorKey,
        minSearchLength,
        "listValeur"
      );
    }
    // }, this._dossierService.delay);

    this._dossierService.getDepartements()
      .subscribe(
        (depts) => {
          this.depts = depts;
          this.depts.sort(MethodeGenerique.sortingDepartement);
          if (this.formDossier && this.depts) {
            this.filteredDepts = GeneriqueListValeur.filtringList(this.depts, this.deptControl, this.deptValidatorKey, minSearchLength, 'departement');
          }
        },
        (error: HttpErrorResponse) => {
          const snackbarRef = this._snackbar.open('Le référentiel département est indisponible. Contactez l\'administrateur', 'X', snackbarConfigError);
          snackbarRef.afterDismissed()
            .subscribe(() => {
              console.error(error);
              this.submitted = false;
              this._changeDetector.detectChanges();
            });
        });
  }

  /**
   * Manages how a thematic should be displayed in the input
   * @param thematique a given thematic to be formatted
   */
  displayThematique(thematique: Thematique): string | undefined {
    if (thematique) {
      return `${thematique.code} - ${thematique.libelle}`;
    }
  }

  /**
   * Manages how a department should be displayed in the input
   * @param dept a given department to be formatted
   */
  displayDept(dept: Departements): string | undefined {
    if (dept) {
      return `${dept.numero} - ${dept.nomDept}`;
    }
  }

  close() {
    this._router.navigate(["/accueil"]);
  }

  /**
   * Configures OK / KO Material Dialog and returns the reference
   */
  openConfirmDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.width = "350px";
    const myDialog = this.dialog.open(ConfirmPopupComponent, {
      data: {
        valueStatusError: this.recoverErrorStatus(),
        typeAction: "create"
      },
      width: "350px"
    });

    myDialog.afterClosed().subscribe(result => {
      if (result === true) {
        this.valueCloseDialog = true;
        // Reset the form to pristine
        if (this.formDossier && !this.formDossier.pristine) {
          this.formDossier.markAsPristine();
        }
      }
    });
    return myDialog;
  }

  /**
   * Recover the error status or not from the page
   */
  recoverErrorStatus(): Observable<boolean> | boolean {
    if (
      !this.formDossier.valid ||
      this.submitted ||
      this.beneficiaire === null ||
      !this.beneficiaire.actif
    ) {
      this.pageHasError = true;
    } else {
      this.pageHasError = false;
    }
    return this.pageHasError;
  }

  /**
   * Implements the guard canDeactivate() logic to being redirected
   */
  canDeactivate(): Observable<boolean> | boolean {
    this.checkFormStatus();
    if (!this.formDossier.pristine && !this.submitted) {
      return this.openConfirmDialog()
        .beforeClosed()
        .pipe(
          map((dialogResult: boolean) => {
            return dialogResult;
          })
        );
    }
    return true;
  }

  /**
   * Resets the form values and compare the objects
   * to allow deactivation since nothing impactful has been done
   */
  checkFormStatus() {
    MethodeGenerique.resetEmptyFormValues(this.formDossier);
    const emptyDossierCreate = {
      thematique: null,
      dept: null,
      intitule: null,
      benef_number: null
    };

    if (
      JSON.stringify(this.formDossier.value) ===
      JSON.stringify(emptyDossierCreate)
    ) {
      this.formDossier.markAsPristine();
      this.formDossier.markAsUntouched();
    }
  }

  onSubmit() {
    this.spinnerLuncher.show();
    this.submitted = true;
    const deptNumero = (this.deptControl.value as Departements).numero;
    const formattedDossier: DossierCreate = {
      beneficiaire: this.beneficiaire,
      departement: deptNumero,
      intitule: this.intituleControl.value,
      thematique: this.thematiqueControl.value as Thematique,
      responsableTechnique: null,
      responsableAdministratif: null
    };

    this._dossierService.createDossier(formattedDossier).subscribe(
      dossier => {
        const formattedDossierNumber = `${dossier.thematique.code}-${
          dossier.departement
          }-${dossier.noOrdreFormate}`;
        this._snackbar.open(
          `Le dossier ${formattedDossierNumber} a bien été créé.`,
          "X",
          snackbarConfigSuccess
        );
        // Redirect to update dossier
        this.spinnerLuncher.hide();
        this._router.navigate([`dossier/${dossier.id}`]);
      },
      (error: HttpErrorResponse) => {
        const snackMessage = getErrorMessage(error, `La création du dossier a échoué. Contacter l'administrateur.`);
        const snackbarRef = this._snackbar.open(snackMessage, 'X', snackbarConfigError);
        this.spinnerLuncher.hide();
        snackbarRef.afterDismissed()
          .subscribe(() => {
            this.submitted = false;
            this._changeDetector.detectChanges();
            console.error(error);
          });
      });

  }


  /**
   * Open popup of search  beneficiary
   */
  searchBeneficiary() {
    BeneficiaireHandler.searchBeneficiary(
      this.submitted,
      this.benefLibelleControl,
      this.benefNumberControl,
      this.beneficiaire,
      this.dialog
    );
  }

  /**
   * Destroys pending subscriptions
   */
  ngOnDestroy() {
    if (this.snackbarSubscription) {
      this.snackbarSubscription.unsubscribe();
    }
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
