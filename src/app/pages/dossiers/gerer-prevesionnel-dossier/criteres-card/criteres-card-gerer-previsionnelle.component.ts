import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, EventEmitter, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import {
  NatureOperation,
  NiveauPriorite,
  ProcedureDecision,
  SessionDecision,
} from 'app/pages/dossiers/dossier/dossier.interface';
import { Critere } from 'app/pages/dossiers/recherche-dossier/recherche-dossier.interface';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { GenericVariablesSearch } from 'app/shared/generic.variables';
import { minSearchLength, SpinnerLuncher } from 'app/shared/methodes-generiques';
import BeneficiaireHandler from 'app/shared/shared.beneficiare';
import { getErrorMessage } from 'app/shared/shared.retourApi';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import NumberUtils from 'app/shared/utils/number-utils';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { Phase, Thematique } from '../../create-dossier/create-dossier.interface';
import { BenefRegex } from '../../dossiers.interface';
import { DossierService } from '../../dossiers.service';


/**
 * Component that creates form of search
 */
@Component({
  selector: 'siga-criteres-gerer-previsionnelle',
  templateUrl: './criteres-card-gerer-previsionnelle.component.html',
  styleUrls: ['./criteres-card-gerer-previsionnelle.component.scss'],
})
export class CritereCardGererPrevisionnelleComponent extends GenericVariablesSearch implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  /**
  * Used to avoid multi-click from the user
  */
  private unsubscribe = new Subject<void>();

  /**
   * The object reprensenting the all criteres to search for
   */
  formCritere: FormGroup;

  get thematiqueControl() { return this.formCritere.get('thematique'); }
  get phaseControl() { return this.formCritere.get('phase'); }
  get prioriteControl() { return this.formCritere.get('priorite'); }
  get sessionControl() { return this.formCritere.get('session'); }
  get benefNumberControl() { return this.formCritere.get('benefNumber'); }
  get benefLibelleControl() { return this.formCritere.get('benef_libelle'); }
  get anneeControl() { return this.formCritere.get('annee') };

  /**
   * Emits the Criteres selected to the parent component
   */
  @Output() searchEventEmitter: EventEmitter<Critere> = new EventEmitter();

  /**
   * The Message of exception handler if beneficaire does not exist
   */
  message: string;
  minSearchLength = 3;

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  /**
   *
// tslint:disable-next-line:whitespace
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
      priorite: ['', []],
      phase: ['', []],
      benefNumber: ['', [Validators.pattern(BenefRegex)]],
      benef_libelle: [{ value: '', disabled: true }],
      annee: ['', []],
      session: ['', []],
    }, {});

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
    if (this.formCritere && this.phases) {
      this.filteredPhases = GeneriqueListValeur.filtringList(this.phases, this.phaseControl, this.phaseValidatorKey, minSearchLength, 'listValeur');
    }
    if (this.formCritere && this.priorites) {
      this.filteredPriorites = GeneriqueListValeur.filtringList(this.priorites, this.prioriteControl, this.prioriteValidatorKey, minSearchLength, 'listValeur');
    }
    if (this.formCritere && this.sessions) {
      this.filteredSessions = GeneriqueListValeur.filtringList(this.sessions, this.sessionControl, this.sessionValidatorKey, minSearchLength, 'sessionDecision');
    }
  }

  ngAfterViewInit() {
    // wait until destroy dossier component
    setTimeout(() => {
      this.updateFormData(this._dossierService.formPrevGestion);
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
          priorite: formDataRecherche.get('priorite').value,
          phase: formDataRecherche.get('phase').value,
          annee: formDataRecherche.get('annee').value,
          session: formDataRecherche.get('session').value,
          benefNumber: formDataRecherche.get('benefNumber').value,
          benef_libelle: formDataRecherche.get('benef_libelle').value

        }, { emitEvent: false }
      );
      this.onSubmit(false);
    }
  }

  /**
   * Manages how a thematic should be displayed in the input
   * @param thematique a given thematic to be formatted
   */
  displayThematique(thematique: Thematique): string | undefined {
    if (thematique) {
      return `${thematique.code}`;
    }
  }

  /**
   * Manages how a nature should be displayed in the input
   * @param nature a given nature to be formatted
   */
  displayNature(nature: NatureOperation) {
    if (nature) {
      return `${nature.ligne}.${nature.numero} - ${nature.libelle}`;
    }
  }

  /**
  * Manages how a session should be displayed in the input
  * @param session a given SessionDecision to be formatted
  */
  displaySessionDecision(session: SessionDecision): string | undefined {
    if (session) {
      return `${session.numero}`;
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
   * Manages how a priorite should be displayed in the input
   * @param priorite a given NiveauPriorite to be formatted
   */
  displayNiveauPriorite(priorite: NiveauPriorite) {
    if (priorite) {
      return `${priorite.code}`;
    }
  }

  /**
  * Manages how a procedureDecision should be displayed in the input
  * @param procedureDecision a given ProcedureDecision to be formatted
  */
  displayProcedureDecision(procedureDecision: ProcedureDecision): string | undefined {
    if (procedureDecision) {
      return `${procedureDecision.code}`;
    }
  }

  onSubmit(emptyStoredValues: boolean) {

    this.spinnerLuncher.show();
    this.submitted = true;
    if (emptyStoredValues) {
      this.emptyCheckedList();
    }

    this._dossierService.formPrevGestion = this.formCritere;
    const critereToSend: Critere = {
      thematique: this.thematiqueControl.value ? this.thematiqueControl.value.id : null,
      phase: this.phaseControl.value ? this.phaseControl.value.code : null,
      priorite: this.prioriteControl.value ? this.prioriteControl.value.id : null,
      annee: this.anneeControl.value ? this.anneeControl.value : null,
      sessionPrev: this.sessionControl.value ? this.sessionControl.value.id : null,
      codeBenef: this.benefNumberControl.value ? this.benefNumberControl.value.toString().toUpperCase() : null,
      nbElemPerPage: 100000,
      listPhase: this.phaseControl.value ? null : ['P00', 'P10', 'P20', 'T10'],
      responsableTech: window.localStorage.getItem('userName')
    }
    this.searchEventEmitter.emit(critereToSend);
  }

  emptyCheckedList() {
    this._dossierService.idsCheckedDossier = [];
    this._dossierService.checkAll = null;
  }

  clearDisplayedDataSession() {
    this.sessionControl.setValue('');
    this.anneeControl.setValue('');
    this.sessionControl.markAsTouched();
  }

  /**
   * Open popup of search  beneficiary
   */
  searchBeneficiary() {
    BeneficiaireHandler.searchBeneficiary(this.submitted, this.benefLibelleControl, this.benefNumberControl, this.beneficiaire, this.dialog)
  }

  /**
   * US 3179
   *
   * @param event
   */
  onSessionSelect(event: MatAutocompleteSelectedEvent) {
    if (event && event.option) {
      this.anneeControl.setValue(event.option.value.annee);
    }
  }

  /**
   * US 3179
   * @param control
   */
  onBlur(control) {
    if (control) {
      const annee = control.value;
      if (annee && annee.toString().length === 4 && annee < 1950) {
        this.anneeControl.setErrors({ 'matDatepickerMin': true });
      }
      if (annee && annee.toString().length === 4 && annee < new Date().getFullYear()) {
        this.anneeControl.setErrors({ 'matDatepickerPrev': true });
      }
      if (annee && annee.toString().length === 4 && annee > 2050) {
        this.anneeControl.setErrors({ 'matDatepickerMax': true });
      }
    }
    if (!this.anneeControl.errors) {
      this.sessionControl.setValue(null);
    }
  }

  /**
  *Character no supported
  * @param control
  */
  onlyNumber(control: any, event?: any) {
    const positionInit = event && event.target ? event.target.selectionStart : 0;
    control.setValue(NumberUtils.onlyNumber(control.value));
    if (event && event.target) {
      event.target.selectionEnd = positionInit;
    }
  }
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
