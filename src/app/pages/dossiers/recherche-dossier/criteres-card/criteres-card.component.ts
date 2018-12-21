import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, EventEmitter, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { GenericVariablesSearch } from 'app/shared/generic.variables';
import { minSearchLength, SpinnerLuncher } from 'app/shared/methodes-generiques';
import BeneficiaireHandler from 'app/shared/shared.beneficiare';
import { getErrorMessage } from 'app/shared/shared.retourApi';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { Phase, ResponsableTechnique, Thematique } from '../../create-dossier/create-dossier.interface';
import { BenefRegex, Departements, IncrementRegex } from '../../dossiers.interface';
import { DossierService } from '../../dossiers.service';
import { Critere } from '../recherche-dossier.interface';


/**
 * Component that creates form of search
 */
@Component({
  selector: 'siga-criteres-card',
  templateUrl: './criteres-card.component.html',
  styleUrls: ['./criteres-card.component.scss'],
})
export class CritereCardComponent extends GenericVariablesSearch implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  private unsubscribe = new Subject<void>();

  /**
   * The object reprensenting the all criteres to search for
   */
  formCritere: FormGroup;


  get thematiqueControl() { return this.formCritere.get('thematique'); }
  get deptControl() { return this.formCritere.get('dept'); }
  get respTechControl() { return this.formCritere.get('responsableTech'); }
  get phaseControl() { return this.formCritere.get('phase'); }
  get numeroIncrementControl() { return this.formCritere.get('numeroIncrement'); }
  get benefNumberControl() { return this.formCritere.get('benefNumber'); }
  get benefLibelleControl() { return this.formCritere.get('benef_libelle'); }

  /**
   * Emits the Criteres selected to the parent component
   */
  @Output() searchEventEmitter: EventEmitter<Critere> = new EventEmitter();

  /**
   * The Message of exception handler if beneficaire does not exist
   */
  message: string;

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  /**
   *
   * @param _formBuilder used to create the form
   * @param _dossierService used to manage dossiers
   */
  constructor(
    private _formBuilder: FormBuilder,
    private _dossierService: DossierService,
    public translate: TranslateService,
    public dialog: MatDialog,
    private spinnerLuncher: SpinnerLuncher
  ) {
    super()
  }

  /**
   * Initializes the form and the specific inputs
   */
  ngOnInit() {
    this.formCritere = this._formBuilder.group({
      thematique: ['', []],
      dept: [''],
      numeroIncrement: ['', [Validators.pattern(IncrementRegex)]],
      responsableTech: [''],
      benefNumber: ['', [Validators.pattern(BenefRegex)]],
      benef_libelle: [{ value: '', disabled: true }],
      phase: ['', []],

    }, { validator: this.formCritereValidator() });

    // Bénéficiaire libelle handler
    this.benefNumberControl.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(
      (value) => {
        this.message = null;
        this.beneficiaire = null;

        if (!this.benefNumberControl.hasError('pattern')
          && !this.benefNumberControl.hasError('required')) {
          this.benefNumberControl.markAsTouched();
        }

        if (this.benefNumberControl.hasError('pattern')
          && this.benefNumberControl.value.length === 9) {
          this.benefNumberControl.markAsTouched();
        }

        if (this.benefNumberControl.valid && this.benefNumberControl.value !== '') {
          const benef_number = (this.benefNumberControl.value as string).toUpperCase();
          this._dossierService.getBeneficaire(benef_number)
            .subscribe((beneficiaire) => {
              this.beneficiaire = beneficiaire;
              this.benefLibelleControl.setValue(beneficiaire.raisonSociale);
              if (this.beneficiaire && !this.beneficiaire.actif) {
                this.benefNumberControl.setErrors({ 'benefInactive': true });
              }
            },
              (error: HttpErrorResponse) => {
                this.message = getErrorMessage(error);
                this.benefNumberControl.setErrors({ 'benefNotFound': true });
                this.benefLibelleControl.setValue('');
              });
        } else {
          this.benefLibelleControl.setValue('');
        }
      }
    );
  }

  ngOnChanges() {

    if (this.formCritere && this.thematiques) {
      this.filteredThematiques = GeneriqueListValeur.filtringList(this.thematiques, this.thematiqueControl, this.thematiqueValidatorKey, minSearchLength, 'listValeur');
    }
    if (this.formCritere && this.depts) {
      this.filteredDepts = GeneriqueListValeur.filtringList(this.depts, this.deptControl, this.deptValidatorKey, minSearchLength, 'departement');
    }
    if (this.formCritere && this.responsablesTech) {
      this.filteredResponsablesTech = GeneriqueListValeur.filtringList(this.responsablesTech, this.respTechControl, this.respTechValidatorKey, minSearchLength, 'responsableTech');
    }
    if (this.formCritere && this.phases) {
      this.filteredPhases = GeneriqueListValeur.filtringList(this.phases, this.phaseControl, this.phaseValidatorKey, minSearchLength, 'listValeur');
    }
  }

  ngAfterViewInit() {
    // wait until destroy dossier component
    /** TODO: Enlever le setTimeout pour récevoir rapidement les données  **/
    setTimeout(() => {
      this.updateFormData(this._dossierService.formCritere);
    }, 1500);
  }

  /**
 * Patches the values from the service in the form
 */
  updateFormData(formDataRecherche: FormGroup) {
    if (formDataRecherche != null) {
      this.formCritere.patchValue(
        {
          thematique: formDataRecherche.get('thematique').value,
          dept: formDataRecherche.get('dept').value,
          numeroIncrement: formDataRecherche.get('numeroIncrement').value,
          responsableTech: formDataRecherche.get('responsableTech').value,
          benefNumber: formDataRecherche.get('benefNumber').value,
          benef_libelle: formDataRecherche.get('benef_libelle').value,
          phase: formDataRecherche.get('phase').value,
        }, { emitEvent: false }
      );

      this.onSubmit();
    }
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
   * Manages how a departement should be displayed in the input
   * @param dept a given departement to be formatted
   */
  displayDept(dept: Departements) {
    if (dept) {
      return `${dept.numero} - ${dept.nomDept}`;
    }
  }

  /**
   * Manages how a responsable technique should be displayed in the input
   * @param responsableTech a given responsable technique to be formatted
   */
  displayResponsableTech(responsableTech: ResponsableTechnique) {
    if (responsableTech) {
      return `${responsableTech.prenom}  ${responsableTech.nom}`;
    }
  }

  /**
 * Manages how a phase should be displayed in the input
 * @param phase a given phase to be formatted
 */
  displayPhase(phase: Phase) {
    if (phase) {
      return `${phase.code}`;
    }
  }

  /**
   * Custom validator that verifies at least one of the fields in the form is filled
   */
  formCritereValidator() {
    return (group: FormGroup) => {
      if (this.formCritere && this.thematiqueControl.value === ''
        && this.deptControl.value === ''
        && this.respTechControl.value === ''
        && this.numeroIncrementControl.value === ''
        && this.benefNumberControl.value === ''
        && this.phaseControl.value === '') {
        return { 'noCritereFieldInputed': true }
      }
      return null;
    }
  }

  onSubmit() {
    this.spinnerLuncher.show();
    this.submitted = true;
    this._dossierService.formCritere = this.formCritere;
    const critereToSend: Critere = {
      thematique: this.thematiqueControl.value ? this.thematiqueControl.value.id : null,
      departement: this.deptControl.value ? this.deptControl.value.numero : null,
      responsableTech: this.respTechControl.value ? this.respTechControl.value.login : null,
      numeroIncrement: this.numeroIncrementControl.value ? this.numeroIncrementControl.value : null,
      codeBenef: this.benefNumberControl.value ? this.benefNumberControl.value.toString().toUpperCase() : null,
      phase: this.phaseControl.value ? this.phaseControl.value.code : null,
    }
    this.searchEventEmitter.emit(critereToSend);
  }

  /**
* Open popup of search  beneficiary
*/
  searchBeneficiary() {
    BeneficiaireHandler.searchBeneficiary(this.submitted, this.benefLibelleControl, this.benefNumberControl, this.beneficiaire, this.dialog)
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
