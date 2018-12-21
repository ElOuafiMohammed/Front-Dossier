import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatRadioChange } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import {
  Domaine,
  NatureOperation,
  NiveauPriorite,
  ProcedureDecision,
  SessionDecision,
} from 'app/pages/dossiers/dossier/dossier.interface';
import { Critere } from 'app/pages/dossiers/recherche-dossier/recherche-dossier.interface';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { GenericVariablesSearch } from 'app/shared/generic.variables';
import { minSearchLength, SpinnerLuncher } from 'app/shared/methodes-generiques';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { Observable } from 'rxjs';

import { Thematique } from '../../create-dossier/create-dossier.interface';
import { DossierService } from '../../dossiers.service';


/**
 * Component that creates form of search
 */
@Component({
  selector: 'siga-criteres-prepare-session-recherche',
  templateUrl: './criteres-card-prepare-session.component.html',
  styleUrls: ['./criteres-card-prepare-session.component.scss'],
})
export class CritereCardPrepareSessionComponent extends GenericVariablesSearch implements OnInit, OnChanges, AfterViewInit {

  /**
   * The object reprensenting the all criteres to search for
   */
  formCritere: FormGroup;


  get thematiqueControl() { return this.formCritere.get('thematique'); }

  @Input() natures: NatureOperation[] = null;
  filteredNatures: Observable<NatureOperation[]>;
  readonly naturesValidatorKey = 'naturesValidatorKey';
  get natureControl() { return this.formCritere.get('nature'); }

  get listIdNature() {
    var idsOut: number[] = [];
    if (this.natureControl.value) {
      for (let nature of this.natureControl.value) {
        idsOut.push(nature.id);
      }
    }
    return idsOut;
  }

  get domaineControl() { return this.formCritere.get('domaine'); }
  get procedureDecisionsControl() { return this.formCritere.get('procedureDecision'); }
  get prioriteControl() { return this.formCritere.get('priorite'); }
  get sessionControl() { return this.formCritere.get('session'); }
  get choixControl() { return this.formCritere.get('choix'); }
  get roleControl() { return this.formCritere.get('role'); }
  get phaseControl() { return this.formCritere.get('phase'); }


  /**
   * Emits the Criteres selected to the parent component
   */
  @Output() searchEventEmitter: EventEmitter<Critere> = new EventEmitter();
  @Output() sessionEventEmitter: EventEmitter<SessionDecision> = new EventEmitter();

  /**
     * Emits delete nature d'opération
     */
  @Output() recapDelete: EventEmitter<boolean> = new EventEmitter();
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
      nature: [''],
      domaine: [''],
      procedureDecision: ['', [Validators.required]],
      priorite: ['', []],
      choix: ['affecter', []],
      phase: ['T30', []],
      session: ['', []],
    }, { validator: this.formCritereValidator() });
    this.sessionControl.disable();
  }

  ngOnChanges() {

    if (this.formCritere && this.domaines) {

      this.filteredDomaines = GeneriqueListValeur.filtringList(this.domaines, this.domaineControl, this.domaineValidatorKey, minSearchLength, 'listValeur');
    }
    if (this.formCritere && this.thematiques) {
      this.filteredThematiques = GeneriqueListValeur.filtringList(this.thematiques, this.thematiqueControl, this.thematiqueValidatorKey, minSearchLength, 'listValeur');
    }
    if (this.formCritere && this.procedureDecisions) {
      // tslint:disable-next-line:max-line-length
      this.filteredProcedures = GeneriqueListValeur.filtringList(this.procedureDecisions, this.procedureDecisionsControl, this.procedureValidatorKey, minSearchLength, 'listValeur');
    }
    if (this.formCritere && this.priorites) {
      this.filteredPriorites = GeneriqueListValeur.filtringList(this.priorites, this.prioriteControl, this.prioriteValidatorKey, minSearchLength, 'listValeur');
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
      this.updateFormData(this._dossierService.formCommisonAffectation);
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
          nature: formDataRecherche.get('nature').value,
          domaine: formDataRecherche.get('domaine').value,
          priorite: formDataRecherche.get('priorite').value,
          procedureDecision: formDataRecherche.get('procedureDecision').value,
          choix: formDataRecherche.get('choix').value,
          phase: formDataRecherche.get('phase').value,
          session: formDataRecherche.get('session').value,
        }, { emitEvent: false }
      );
      if (this.formCritere.get('procedureDecision').value === '') {
        this.procedureDecisionsControl.setErrors({ required: true });
        this.procedureDecisionsControl.markAsTouched();
        this.sessionControl.disable();
      } else {
        GeneriqueListValeur.fillListSessions(this.formCritere.get('procedureDecision').value.code, this.sessions, this.sessionControl, this.sessionValidatorKey)
        this.sessionControl.enable();
        if (formDataRecherche.get('session').value !== '') {
          this.sessionEventEmitter.emit(formDataRecherche.get('session').value as SessionDecision);
        }
        this.onSubmit(false);
      }
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
      return `${session.annee} - ${session.numero}`;
    }
  }

  /**
   * Manages how a domaine should be displayed in the input
   * @param domaine a given domaine to be formatted
   */
  displayDomaine(domaine: Domaine) {
    if (domaine) {
      return `${domaine.libelle}`;
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
        && this.natureControl.value === ''
        && this.domaineControl.value === ''
        && this.procedureDecisionsControl.value === ''
        && this.prioriteControl.value === ''
        && this.phaseControl.value === ''
        && this.choixControl.value === ''
        && this.roleControl.value === ''
      ) {
        return { 'noCritereFieldInputed': true }
      }
      return null;
    }
  }

  onValidationSelectOption(event: MatRadioChange) {
    if (this.choixControl.value === 'affecter') {
      this.phaseControl.setValue('T30');
      if (this.sessionControl.value === '') {
        this.sessionControl.setErrors(null);
      }
    } else {
      if (this.sessionControl.value === '') {
        this.sessionControl.setErrors({ required: true });
      }
      this.phaseControl.setValue('T35');
    }
  }

  /**
  * Triggers when a Procedure has been selected
  * @param event the event containing the selected option
  */
  onSessionSelect(event: MatAutocompleteSelectedEvent) {

    const selectedPro = (event.option.value as ProcedureDecision);
    this.sessionControl.enable();
    this.sessionControl.setValue('');
    if (this.choixControl.value === 'retirer') {
      this.sessionControl.setErrors({ required: true });
    }
    this.sessionEventEmitter.emit(null);
    this.filteredSessions = GeneriqueListValeur.fillListSessions(selectedPro.code, this.sessions, this.sessionControl, this.sessionValidatorKey);
  }

  /**
* Triggers when a Annee has been selected
* @param event the event containing the selected option
*/
  onAnneeSelect(event: MatAutocompleteSelectedEvent) {
    const selectedAnnee = (event.option.value as SessionDecision);
    this.sessionEventEmitter.emit(selectedAnnee);
  }

  onSubmit(emptyStoredValues: boolean) {
    this.spinnerLuncher.show();
    this.submitted = true;
    if (emptyStoredValues) {
      this.emptyCheckedList();
    }
    this._dossierService.formCommisonAffectation = this.formCritere;

    const critereToSend: Critere = {
      thematique: this.thematiqueControl.value ? this.thematiqueControl.value.id : null,
      domaine: this.domaineControl.value ? this.domaineControl.value.id : null,
      phase: this.phaseControl.value ? this.phaseControl.value : null,
      priorite: this.prioriteControl.value ? this.prioriteControl.value.id : null,
      procedureDecision: this.procedureDecisionsControl.value ? this.procedureDecisionsControl.value.id : null,
      listNatureOperation: this.natureControl.value ? this.listIdNature : null,
      session: this.phaseControl.value ? this.phaseControl.value === 'T35' ? this.sessionControl.value.id : null : null,
      nbElemPerPage: 100000,
    }
    this.searchEventEmitter.emit(critereToSend);
  }

  emptyCheckedList() {
    this._dossierService.idsCheckedDossier = [];
    this._dossierService.checkAll = null;
  }

  clearDisplayedDataProcedure() {
    this.procedureDecisionsControl.setValue('');
    this.procedureDecisionsControl.setErrors({ required: true })
    this.procedureDecisionsControl.markAsTouched();
    this.sessionControl.setValue('');
    this.sessionControl.disable();
    this.sessionEventEmitter.emit(null);
  }

  clearDisplayedDataSession() {
    this.sessionControl.setValue('');
    this.sessionControl.markAsTouched();
    if (this.choixControl.value === 'retirer') {
      this.sessionControl.setErrors({ required: true });
    }
    this.sessionEventEmitter.emit(null);
  }

  compareListElement(compareItem1: any, compareItem2: any) {

    return compareItem1 && compareItem2 && compareItem1.id === compareItem2.id;
  }

  onDeleteEventNature(event) {
    const newNatureList: NatureOperation[] = this.natureControl.value.filter((nature) => {
      if (event.id !== nature.id) {
        return nature;
      }
    });
    this.natureControl.setValue(newNatureList);
    this.recapDelete.emit(true);
  }

}
