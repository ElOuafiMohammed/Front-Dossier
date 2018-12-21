import { AfterViewInit, Component, EventEmitter, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatRadioChange } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { DossierAction, NiveauPriorite, ProcedureDecision } from 'app/pages/dossiers/dossier/dossier.interface';
import { Critere } from 'app/pages/dossiers/recherche-dossier/recherche-dossier.interface';
import { Delegation } from 'app/pages/dossiers/validate-dossier/validate-dossier.interface';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { GenericVariablesSearch } from 'app/shared/generic.variables';
import { minSearchLength, SpinnerLuncher } from 'app/shared/methodes-generiques';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';

import { ResponsableTechnique, Thematique } from '../../create-dossier/create-dossier.interface';
import { EnumActionDossier, EnumProfilDossier } from '../../dossier/enumeration/enumerations';
import { DossierService } from '../../dossiers.service';


/**
 * Component that creates form of search
 */
@Component({
  selector: 'siga-criteres-card-recherche',
  templateUrl: './criteres-card-recherche.component.html',
  styleUrls: ['./criteres-card-recherche.component.scss'],
})
export class CritereCardRechercheComponent extends GenericVariablesSearch implements OnInit, OnChanges, AfterViewInit {

  /**
   * The object reprensenting the all criteres to search for
   */
  formCritere: FormGroup;
  get thematiqueControl() { return this.formCritere.get('thematique'); }
  get delegationControl() { return this.formCritere.get('delegation'); }
  get respTechControl() { return this.formCritere.get('responsableTech'); }
  get procedureDecisionsControl() { return this.formCritere.get('procedureDecision'); }
  get prioriteControl() { return this.formCritere.get('priorite'); }
  get choixControl() { return this.formCritere.get('choix'); }
  get choixUserControl() { return this.formCritere.get('choixUser'); }
  get phaseControl() { return this.formCritere.get('phase'); }
  /**
  * object where we collect what && ho's to do action
  * */
  // @Output() dossierAction: dossierAction;
  @Output() dossierActionEvent: EventEmitter<DossierAction> = new EventEmitter();
  /**
   * Emits the Criteres selected to the parent component
   */
  @Output() searchEventEmitter: EventEmitter<Critere> = new EventEmitter();

  /**
   * The Message of exception handler if beneficaire does not exist
   */
  message: string;
  doBy = '';
  whatTodo = '';

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
      delegation: [''],
      responsableTech: [''],
      procedureDecision: ['', []],
      priorite: ['', []],
      choix: ['valider', []],
      choixUser: ['', []],
      phase: ['T15', []],

    }, { validator: this.formCritereValidator() });
  }

  ngOnChanges() {
    if (this.formCritere && this.thematiques) {
      this.filteredThematiques = GeneriqueListValeur.filtringList(this.thematiques, this.thematiqueControl, this.thematiqueValidatorKey, minSearchLength, 'listValeur');
    }
    if (this.formCritere && this.delegations) {
      this.filteredDelegations = GeneriqueListValeur.filtringList(this.delegations, this.delegationControl, this.delegationsValidatorKey, minSearchLength, 'listValeur');
    }
    if (this.formCritere && this.responsablesTech) {
      this.filteredResponsablesTech = GeneriqueListValeur.filtringList(this.responsablesTech, this.respTechControl, this.respTechValidatorKey, minSearchLength, 'responsableTech');
    }
    if (this.formCritere && this.procedureDecisions) {
      // tslint:disable-next-line:max-line-length
      this.filteredProcedures = GeneriqueListValeur.filtringList(this.procedureDecisions, this.procedureDecisionsControl, this.procedureValidatorKey, minSearchLength, 'listValeur');
    }
    if (this.formCritere && this.priorites) {
      this.filteredPriorites = GeneriqueListValeur.filtringList(this.priorites, this.prioriteControl, this.prioriteValidatorKey, minSearchLength, 'listValeur');
    }
  }

  ngAfterViewInit() {
    // wait until destroy dossier component
    setTimeout(() => {
      this.updateFormData(this._dossierService.formValidationCritere);
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
          delagation: formDataRecherche.get('delegation').value,
          responsableTech: formDataRecherche.get('responsableTech').value,
          priorite: formDataRecherche.get('priorite').value,
          procedureDecision: formDataRecherche.get('procedureDecision').value,
          choix: formDataRecherche.get('choix').value,
          choixUser: formDataRecherche.get('choixUser').value,
          phase: formDataRecherche.get('phase').value,
        }, { emitEvent: false }
      );

      this.dossierAction = {
        action: formDataRecherche.get('choix').value === 'valider' ? EnumActionDossier.VALIDER : EnumActionDossier.DEVALIDER,
        profil: formDataRecherche.get('choixUser').value === 'DELEGUE' ? EnumProfilDossier.DELEGUE : EnumProfilDossier.DGA,
        ids: []
      }
      this.dossierActionEvent.emit(this.dossierAction);

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
   * Manages how a service departement should be displayed in the input
   * @param delegation a given Delegation to be formatted
   */
  displayDelegation(delegation: Delegation) {
    if (delegation) {
      return `${delegation.code}`;
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

  /**
   * Custom validator that verifies at least one of the fields in the form is filled
   */
  formCritereValidator() {
    return (group: FormGroup) => {
      if (this.formCritere && this.thematiqueControl.value === ''
        && this.delegationControl.value === ''
        && this.respTechControl.value === ''
        && this.procedureDecisionsControl.value === ''
        && this.prioriteControl.value === ''
        && this.phaseControl.value === ''
        && this.choixControl.value === ''
        && this.choixUserControl.value === ''
      ) {
        return { 'noCritereFieldInputed': true }
      }
      return null;
    }
  }

  onValidationSelectDoByOption(event: MatRadioChange) {
    this.doBy = this.choixUserControl.value;
    this.whatTodo = this.choixControl.value;
    this.prepareGenricObject();

  }

  onValidationSelectOption(event: MatRadioChange) {
    this.doBy = this.choixUserControl.value;
    this.whatTodo = this.choixControl.value;
    this.prepareGenricObject();
  }

  prepareGenricObject() {
    if (this.doBy === 'DELEGUE' && this.whatTodo === 'valider') {
      this.dossierAction = {
        action: EnumActionDossier.VALIDER,
        profil: EnumProfilDossier.DELEGUE,
        ids: []
      }
      this.phaseControl.setValue('T15');
    }

    if (this.doBy === 'DGA' && this.whatTodo === 'valider') {
      this.dossierAction = {
        action: EnumActionDossier.VALIDER,
        profil: EnumProfilDossier.DGA,
        ids: []
      }
      this.phaseControl.setValue('T25');
    }
    if (this.doBy === 'DELEGUE' && this.whatTodo === 'devalider') {
      this.dossierAction = {
        action: EnumActionDossier.DEVALIDER,
        profil: EnumProfilDossier.DELEGUE,
        ids: []
      }
      this.phaseControl.setValue('T20');
    }
    if (this.doBy === 'DGA' && this.whatTodo === 'devalider') {
      this.dossierAction = {
        action: EnumActionDossier.DEVALIDER,
        profil: EnumProfilDossier.DGA,
        ids: []
        //   ids: this.getIdsOfCheckedDossiers(true)
      }
      this.phaseControl.setValue('T30');
    }

    this.dossierActionEvent.emit(this.dossierAction);
  }

  onSubmit(emptyStoredValues: boolean) {
    this.spinnerLuncher.show();
    this.submitted = true;
    if (emptyStoredValues) {
      this.emptyCheckedList();
    }
    this._dossierService.formValidationCritere = this.formCritere;
    const critereToSend: Critere = {
      thematique: this.thematiqueControl.value ? this.thematiqueControl.value.id : null,
      responsableTech: this.respTechControl.value ? this.respTechControl.value.login : null,
      phase: this.phaseControl.value ? this.phaseControl.value : null,
      priorite: this.prioriteControl.value ? this.prioriteControl.value.id : null,
      procedureDecision: this.procedureDecisionsControl.value ? this.procedureDecisionsControl.value.id : null,
      codeServiceDept: null,
      departement: null,
      numeroIncrement: null,
      domaine: null,
      codeBenef: null,
      pageAAficher: null,
      nbElemPerPage: 100000,
      delegation: this.delegationControl.value ? this.delegationControl.value.code : null,
      natureOperation: null,
      hasReponseNontraite: null
    }
    this.searchEventEmitter.emit(critereToSend);
  }

  emptyCheckedList() {
    this._dossierService.idsCheckedDossier = [];
    this._dossierService.checkAll = null;
  }

}
