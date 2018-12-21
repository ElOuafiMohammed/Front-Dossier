import { AfterViewInit, Component, EventEmitter, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Domaine, DossierAction, NiveauPriorite, ProcedureDecision } from 'app/pages/dossiers/dossier/dossier.interface';
import { EnumActionDossier, EnumProfilDossier } from 'app/pages/dossiers/dossier/enumeration/enumerations';
import { Critere } from 'app/pages/dossiers/recherche-dossier/recherche-dossier.interface';
import { Delegation } from 'app/pages/dossiers/validate-dossier/validate-dossier.interface';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { GenericVariablesSearch } from 'app/shared/generic.variables';
import { minSearchLength, SpinnerLuncher } from 'app/shared/methodes-generiques';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';

import { Beneficiaire, Thematique } from '../../create-dossier/create-dossier.interface';
import { DossierService } from '../../dossiers.service';

/**
 * Component that creates form of search
 */
@Component({
  selector: 'siga-criteres-rl-sga-card-recherche',
  templateUrl: './criteres-card-rl-sga-recherche.component.html',
  styleUrls: ['./criteres-card-rl-sga-recherche.component.scss'],
})
export class CritereCardRlSgaRechercheComponent extends GenericVariablesSearch implements OnInit, OnChanges, AfterViewInit {

  /**
   * The object reprensenting the all criteres to search for
   */
  formCritere: FormGroup;
  get thematiqueControl() { return this.formCritere.get('thematique'); }


  get delegationControl() { return this.formCritere.get('delegation'); }


  get domaineControl() { return this.formCritere.get('domaine'); }



  get procedureDecisionsControl() { return this.formCritere.get('procedureDecision'); }



  get prioriteControl() { return this.formCritere.get('priorite'); }

  get choixControl() { return this.formCritere.get('choix'); }
  get roleControl() { return this.formCritere.get('role'); }
  get phaseControl() { return this.formCritere.get('phase'); }


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
      domaine: [''],
      procedureDecision: ['', []],
      priorite: ['', []],
      choix: ['valider', []],
      role: ['', [Validators.required]],
      phase: ['T20', []],

    }, { validator: this.formCritereValidator() });

    this.dossierAction = {
      profil: EnumProfilDossier.RL,
      action: EnumActionDossier.VALIDER,
      ids: []
    }
  }

  ngOnChanges() {
    if (this.formCritere && this.thematiques) {
      this.filteredThematiques = GeneriqueListValeur.filtringList(this.thematiques, this.thematiqueControl, this.thematiqueValidatorKey, minSearchLength, 'listValeur');
    }
    if (this.formCritere && this.delegations) {
      this.filteredDelegations = GeneriqueListValeur.filtringList(this.delegations, this.delegationControl, this.delegationsValidatorKey, minSearchLength, 'listValeur');
    }
    if (this.formCritere && this.domaines) {
      this.filteredDomaines = GeneriqueListValeur.filtringList(this.domaines, this.domaineControl, this.domaineValidatorKey, minSearchLength, 'listValeur');
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
      this.updateFormData(this._dossierService.formValidationCritereRlSga);
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
          domaine: formDataRecherche.get('domaine').value,
          priorite: formDataRecherche.get('priorite').value,
          procedureDecision: formDataRecherche.get('procedureDecision').value,
          choix: formDataRecherche.get('choix').value,
          role: formDataRecherche.get('role').value,
          phase: formDataRecherche.get('phase').value,

        }, { emitEvent: false }
      );
      this.devalider_siege = formDataRecherche.get('choix').value === 'valider' ? false : true;
      this.dossierAction.profil = this.roleControl.value === 'Tech' ? EnumProfilDossier.RL : EnumProfilDossier.SGA;

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
  displayDelegation(delegation: Delegation): string | undefined {
    if (delegation) {
      return `${delegation.code}`;
    }
  }

  /**
   * Manages how a domaine should be displayed in the input
   * @param domaine a given domaine to be formatted
   */
  displayDomaine(domaine: Domaine): string | undefined {
    if (domaine) {
      return `${domaine.libelle}`;
    }
  }

  /**
   * Manages how a priorite should be displayed in the input
   * @param priorite a given NiveauPriorite to be formatted
   */
  displayNiveauPriorite(priorite: NiveauPriorite): string | undefined {
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
    return () => {
      if (this.formCritere && this.thematiqueControl.value === ''
        && this.delegationControl.value === ''
        && this.domaineControl.value === ''
        && this.procedureDecisionsControl.value === ''
        && this.prioriteControl.value === ''
        && this.phaseControl.value === ''
        && this.choixControl.value === ''
        && this.roleControl.value === '') {
        return { 'noCritereFieldInputed': true };
      }
      return null;
    }
  }

  onValidationSelectOption() {
    if (this.choixControl.value === 'valider') {
      this.phaseControl.setValue('T20');
      // } else {
      //   this.phaseControl.setValue('T25');
      // }
      this.devalider_siege = false;
    } else {
      this.phaseControl.setValue('');
      this.devalider_siege = true;
    }
  }

  onValidationSelectOptionService() {
    this.dossierAction.profil = this.roleControl.value === 'Tech' ? EnumProfilDossier.RL : EnumProfilDossier.SGA
    this.dossierActionEventEmitter.emit(this.dossierAction);
  }

  onSubmit(emptyStoredValues: boolean) {
    if (this.spinnerLuncher) {
      this.spinnerLuncher.show();
    }
    this.submitted = true;

    if (emptyStoredValues) {
      this.emptyCheckedList();
    }

    this._dossierService.formValidationCritereRlSga = this.formCritere;

    const critereToSend: Critere = {
      thematique: this.thematiqueControl.value ? this.thematiqueControl.value.id : null,
      domaine: this.domaineControl.value ? this.domaineControl.value.id : null,
      phase: this.phaseControl.value ? this.phaseControl.value : null,
      priorite: this.prioriteControl.value ? this.prioriteControl.value.id : null,
      procedureDecision: this.procedureDecisionsControl.value ? this.procedureDecisionsControl.value.id : null,
      delegation: this.delegationControl.value ? this.delegationControl.value.code : null,
      codeServiceDept: null,
      departement: null,
      numeroIncrement: null,
      responsableTech: null,
      codeBenef: null,
      devaliderSiege: this.devalider_siege,
      pageAAficher: null,
      nbElemPerPage: 100000,
      natureOperation: null,
      hasReponseNontraite: null

    }

    this.dossierAction.action = critereToSend.phase === 'T20' ? EnumActionDossier.VALIDER : EnumActionDossier.DEVALIDER;

    this.dossierActionEventEmitter.emit(this.dossierAction);
    this.searchEventEmitter.emit(critereToSend);
  }

  emptyCheckedList() {
    this._dossierService.idsCheckedDossier = [];
    this._dossierService.checkAll = null;
  }
}
