import { Component, OnInit, OnChanges, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';


import { Critere } from 'app/pages/dossiers/recherche-dossier/recherche-dossier.interface';
import { ProcedureDecision, NiveauPriorite, Domaine, DossierAction, SessionDecision } from 'app/pages/dossiers/dossier/dossier.interface';
import { Delegation } from 'app/pages/dossiers/validate-dossier/validate-dossier.interface';
import { EnumProfilDossier, EnumActionDossier } from 'app/pages/dossiers/dossier/enumeration/enumerations';
import { GenericVariablesSearch } from 'app/shared/generic.variables';
import { minSearchLength } from 'app/shared/methodes-generiques';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { Beneficiaire, Thematique, ResponsableTechnique } from '../../../create-dossier/create-dossier.interface';
import { DossierService } from '../../../dossiers.service';
import { IncrementRegex } from 'app/pages/dossiers/dossiers.interface';
import { MatAutocompleteSelectedEvent } from '@angular/material';

/**
 * Component that creates form of search
 */
@Component({
  selector: 'siga-criteres-signer-recherche-card',
  templateUrl: './criteres-card-signer-recherche.component.html',
  styleUrls: ['./criteres-card-signer-recherche.component.scss'],
})
export class CritereCardSignerRechercheComponent extends GenericVariablesSearch implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('inputDept') private inputDept: ElementRef;
  @ViewChild('inputIncrement') private inputIncrement: ElementRef;

  /**
   * The object reprensenting the all criteres to search for
   */
  formCritere: FormGroup;
  get thematiqueControl() { return this.formCritere.get('thematique'); }
  get procedureDecisionsControl() { return this.formCritere.get('procedureDecision'); }
  get respTechControl() { return this.formCritere.get('responsableTech'); }
  get numeroIncrementControl() { return this.formCritere.get('numeroIncrement'); }
  get codeThematiqueControl() { return this.formCritere.get('codeThematique'); }
  get departementControl() { return this.formCritere.get('departement'); }
  get dateControl() { return this.formCritere.get('date'); }
  get roleControl() { return this.formCritere.get('role'); }
  get phaseControl() { return this.formCritere.get('phase'); }
  get sessionControl() { return this.formCritere.get('session'); }


  /**
   * Emits the Criteres selected to the parent component
   */
  @Output() searchEventEmitter: EventEmitter<Critere> = new EventEmitter();
  @Output() dossierActionEventEmitter: EventEmitter<DossierAction> = new EventEmitter();

  /**
   * The beneficaire object to retrieve
   */
  beneficiaire: Beneficiaire;

  /**
   * The Message of exception handler if beneficaire does not exist
   */
  message: string;

  // tslint:disable-next-line:no-inferrable-types
  devalider_siege: boolean = false;

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
    public translate: TranslateService
  ) {
    super()
  }

  /**
   * Initializes the form and the specific inputs
   */
  ngOnInit() {
    this.formCritere = this._formBuilder.group({
      thematique: ['', []],
      responsableTech: [''],
      procedureDecision: ['', []],
      session: ['', []],
      codeThematique: ['', []],
      departement: ['', []],
      numeroIncrement: ['', [Validators.pattern(IncrementRegex)]],
      date: ['', []],
      role: ['', [Validators.required]],
      phase: ['A05', []],

    }, { validator: this.formCritereValidator() });
    this.sessionControl.disable();

    this.dossierAction = {
      profil: EnumProfilDossier.RA,
      action: EnumActionDossier.VERIFIER_ATTRIB,
      ids: []
    }
  }

  ngOnChanges() {
    if (this.formCritere && this.thematiques) {
      this.filteredThematiques = GeneriqueListValeur.filtringList(this.thematiques, this.thematiqueControl, this.thematiqueValidatorKey, minSearchLength, 'listValeur');
    }
    if (this.formCritere && this.procedureDecisions) {
      // tslint:disable-next-line:max-line-length
      this.filteredProcedures = GeneriqueListValeur.filtringList(this.procedureDecisions, this.procedureDecisionsControl, this.procedureValidatorKey, minSearchLength, 'listValeur');
    }

    if (this.formCritere && this.dates) {
      // tslint:disable-next-line:max-line-length
      this.filteredDates = GeneriqueListValeur.filtringList(this.dates, this.dateControl, this.dateValidatorKey, minSearchLength, 'date');
    }

    if (this.formCritere && this.responsablesTech) {
      this.filteredResponsablesTech = GeneriqueListValeur.filtringList(this.responsablesTech, this.respTechControl, this.respTechValidatorKey, minSearchLength, 'responsableTech');
      if ((this.respTechControl.value === null || this.respTechControl.value === '') && (this.roleControl.value === null || this.roleControl.value === '')) {
        this.respTechControl.patchValue(this.findResponsableByName(window.localStorage.getItem('userName')));
      }
    }
    if (this.formCritere && this.sessions) {
      // Set synchronous validator once the data is available
      this.sessionControl.setValidators([
        GeneriqueListValeur.sigaAutocompleteValidatorFactory(this.sessions, this.sessionValidatorKey)
      ]);
    }

  }

  ngAfterViewInit() {
    // wait until destroy dossier component
    setTimeout(() => {
      this.updateFormData(this._dossierService.formSignerVerifier);
    }, 1500);
  }

  findResponsableByName(login: string): ResponsableTechnique {
    let responsableDetecte = null;
    this.responsablesTech.forEach(responsable => {
      if (responsable.login === login) {
        responsableDetecte = responsable;
      }
    });
    return responsableDetecte;
  }

  /**
 * Patches the values from the service in the form
 */
  updateFormData(formDataRecherche: FormGroup) {
    if (formDataRecherche != null) {
      this.formCritere.patchValue(
        {
          thematique: formDataRecherche.get('thematique').value,
          responsableTech: formDataRecherche.get('responsableTech').value,
          numeroIncrement: formDataRecherche.get('numeroIncrement').value,
          date: formDataRecherche.get('date').value,
          procedureDecision: formDataRecherche.get('procedureDecision').value,
          role: formDataRecherche.get('role').value,
          departement: formDataRecherche.get('departement').value,
          codeThematique: formDataRecherche.get('codeThematique').value,
          phase: formDataRecherche.get('phase').value,
          session: formDataRecherche.get('session').value,

        }, { emitEvent: false }
      );
      if (this.formCritere.get('procedureDecision').value !== '' && this.formCritere.get('procedureDecision').value !== null) {
        this.filteredSessions = GeneriqueListValeur.fillListSessions(this.formCritere.get('procedureDecision').value.code, this.sessions, this.sessionControl, this.sessionValidatorKey);
        this.sessionControl.enable();
      }
      this.dossierAction.profil = formDataRecherche.get('role').value;
      this.dossierActionEventEmitter.emit(this.dossierAction);
      this.onSubmit(false);
    }
  }

  clearDisplayedDataSession() {
    this.sessionControl.setValue('');
  }
  /**
* Manages how a session should be displayed in the input
* @param session a given SessionDecision to be formatted
*/
  displaySessionDecision(session: SessionDecision): string | undefined {
    if (session) {
      return `${session.annee} - ${session.numero}`;
    }
  }
  clearDisplayedDataProcedure() {
    this.procedureDecisionsControl.setValue('');
    this.sessionControl.setValue(null);
    this.sessionControl.disable();
  }

  focusDept(event: any) {
    if (event.target.value.length === 4) {
      this.inputDept.nativeElement.focus();
    }
  }

  focusNumeroIncrement(event: any) {
    if (event.target.value.length === 3) {
      this.inputIncrement.nativeElement.focus();
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
 * Manages how a procedureDecision should be displayed in the input
 * @param procedureDecision a given ProcedureDecision to be formatted
 */
  displayProcedureDecision(procedureDecision: ProcedureDecision): string | undefined {
    if (procedureDecision) {
      return `${procedureDecision.code}`;
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
   * Custom validator that verifies at least one of the fields in the form is filled
   */
  formCritereValidator() {
    return () => {
      if (this.formCritere && this.thematiqueControl.value === ''
        && this.numeroIncrementControl.value === ''
        && this.codeThematiqueControl.value === ''
        && this.departementControl.value === ''
        && this.respTechControl.value === ''
        && this.procedureDecisionsControl.value === ''
        && this.phaseControl.value === ''
        && this.dateControl.value === ''
        && this.roleControl.value === '') {
        return { 'noCritereFieldInputed': true };
      }
      return null;
    }
  }

  onValidationSelectOptionService() {
    let role = this.roleControl.value;
    this.dossierAction.profil = role;
    if (role === 'DDG') {
      this.dossierAction.action = EnumActionDossier.SIGNER_ATTRIB;
    } else {
      this.dossierAction.action = EnumActionDossier.VERIFIER_ATTRIB;
    }
    this.dossierActionEventEmitter.emit(this.dossierAction);
  }

  onSubmit(emptyStoredValues: boolean) {

    this.submitted = true;

    if (emptyStoredValues) {
      this.emptyCheckedList();
    }

    this._dossierService.formSignerVerifier = this.formCritere;

    const critereToSend: Critere = {
      thematique: this.thematiqueControl.value ? this.thematiqueControl.value.id : null,
      phase: this.phaseControl.value ? this.phaseControl.value : null,
      procedureDecision: this.procedureDecisionsControl.value ? this.procedureDecisionsControl.value.id : null,
      numeroIncrement: this.numeroIncrementControl.value ? this.numeroIncrementControl.value : null,
      codeThematique: this.codeThematiqueControl.value ? this.codeThematiqueControl.value.toUpperCase() : null,
      departement: this.departementControl.value ? this.departementControl.value : null,
      dateAttribution: this.dateControl.value ? this.dateControl.value : null,
      loginResponsableAdm: this.respTechControl.value ? this.respTechControl.value.login : null,
      session: this.sessionControl.value ? this.sessionControl.value.id : null,
      isSigne: false,
      nbElemPerPage: 100000,
    }
    this.searchEventEmitter.emit(critereToSend);
  }

  formatIncrement(event: any) {
    let value = event.target.value;

    if (event.target.value.length === 1) {
      value = '0000' + event.target.value;
    }
    if (event.target.value.length === 2) {
      value = '000' + event.target.value;
    }
    if (event.target.value.length === 3) {
      value = '00' + event.target.value;
    }
    if (event.target.value.length === 4) {
      value = '0' + event.target.value;
    }

    this.numeroIncrementControl.setValue(value);
  }
  /**
* Triggers when a Procedure has been selected
* @param event the event containing the selected option
*/
  onSessionSelect(event: MatAutocompleteSelectedEvent) {
    const selectedPro = (event.option.value as ProcedureDecision);
    this.sessionControl.enable();
    this.sessionControl.setValue('');
    this.filteredSessions = GeneriqueListValeur.fillListSessions(selectedPro.code, this.sessions, this.sessionControl, this.sessionValidatorKey);
  }


  emptyCheckedList() {
    this._dossierService.idsCheckedDossier = [];
    this._dossierService.checkAll = null;
  }
}
