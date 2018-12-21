import { AfterViewInit, Component, EventEmitter, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { DossierAction, ProcedureDecision, SessionDecision } from 'app/pages/dossiers/dossier/dossier.interface';
import { Critere } from 'app/pages/dossiers/recherche-dossier/recherche-dossier.interface';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { GenericVariablesSearch } from 'app/shared/generic.variables';
import { minSearchLength, SpinnerLuncher } from 'app/shared/methodes-generiques';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';

import { Thematique } from '../../../create-dossier/create-dossier.interface';
import { DossierService } from '../../../dossiers.service';

@Component({
  selector: 'siga-criteres-saisir-avis',
  templateUrl: './criteres-saisir-avis.component.html',
  styleUrls: ['./criteres-saisir-avis.component.scss']
})
export class CriteresSaisirAvisComponent extends GenericVariablesSearch implements OnInit, OnChanges, AfterViewInit {

  procedureIsRequired = true;

  /**
   * The object reprensenting the all criteres to search for
   */
  formCritereSaisirAvis: FormGroup;
  get thematiqueControl() { return this.formCritereSaisirAvis.get('thematique'); }
  get procedureDecisionsControl() { return this.formCritereSaisirAvis.get('procedureDecision'); }
  get sessionControl() { return this.formCritereSaisirAvis.get('session'); }

  @Output() dossierActionEvent: EventEmitter<DossierAction> = new EventEmitter();
  dossierAction: DossierAction;

  /**
   * Emits the Criteres selected to the parent component
   */
  @Output() searchEventEmitter: EventEmitter<Critere> = new EventEmitter();

  /**
   * The Message of exception handler if beneficaire does not exist
   */
  message: string;
  minSearchLength = 3;
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
    this.formCritereSaisirAvis = this._formBuilder.group({
      thematique: ['', []],
      procedureDecision: ['', []],
      session: ['', []],
      phase: ['T35', []],

    }, { validator: this.formCritereValidator() }
    );
    this.sessionControl.disable();
  }

  ngAfterViewInit() {
    this.updateFormData(this._dossierService.formResultatRecherche)
  }
  ngOnChanges() {
    if (this.formCritereSaisirAvis && this.thematiques) {
      this.filteredThematiques = GeneriqueListValeur.filtringList(this.thematiques, this.thematiqueControl, this.thematiqueValidatorKey, minSearchLength, 'listValeur');
    }
    if (this.formCritereSaisirAvis && this.procedureDecisions) {
      // tslint:disable-next-line:max-line-length
      this.filteredProcedures = GeneriqueListValeur.filtringList(this.procedureDecisions, this.procedureDecisionsControl, this.procedureValidatorKey, minSearchLength, 'listValeur');
    }
    if (this.formCritereSaisirAvis && this.sessions) {
      // Set synchronous validator once the data is available
      this.sessionControl.setValidators([
        GeneriqueListValeur.sigaAutocompleteValidatorFactory(this.sessions, this.sessionValidatorKey)
      ]);

    }
  }
  /**
   * Custom validator that verifies at least one of the fields in the form is filled
   */
  formCritereValidator() {
    return (group: FormGroup) => {
      if (this.formCritereSaisirAvis
        && this.procedureDecisionsControl.value === ''
      ) {
        return { 'noCritereFieldInputed': true }
      }
      return null;
    }
  }

  /**
 * Patches the values from the service in the form
 */
  updateFormData(formDataRecherche: FormGroup) {
    if (formDataRecherche != null) {
      this.formCritereSaisirAvis.patchValue(
        {
          thematique: formDataRecherche.get('thematique').value,
          procedureDecision: formDataRecherche.get('procedureDecision').value,
          session: formDataRecherche.get('session').value
        }, { emitEvent: false }
      );
      if (formDataRecherche.get('procedureDecision').value) {
        this.sessionControl.enable();
        GeneriqueListValeur.fillListSessions(formDataRecherche.get('procedureDecision').value.code, this.sessions, this.sessionControl, this.sessionValidatorKey)
      }
      this.onSubmit(false);
    }
  }

  clearDisplayedDataSession() {
    this.sessionControl.setValue('');
  }

  clearDisplayedDataProcedure() {
    this.procedureDecisionsControl.setValue('');
    this.procedureDecisionsControl.setErrors({ required: true });
    this.procedureIsRequired = false;
    this.procedureDecisionsControl.markAsTouched();
    this.sessionControl.setValue(null);
    this.sessionControl.disable();
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
* Manages how a session should be displayed in the input
* @param session a given SessionDecision to be formatted
*/
  displaySessionDecision(session: SessionDecision): string | undefined {
    if (session) {
      return `${session.annee} - ${session.numero}`;
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
  * Triggers when a Annee has been selected
  * @param event the event containing the selected option
  */
  onAnneeSelect(event: MatAutocompleteSelectedEvent) {
    const selectedAnnee = (event.option.value as SessionDecision);
  }

  onSubmit(emptyStoredValues: boolean) {
    this.spinnerLuncher.show();
    setTimeout(() => {
      this.submitted = true;
      if (emptyStoredValues) {
        this.emptyCheckedList();
      }
      this._dossierService.formResultatRecherche = this.formCritereSaisirAvis;
      const critereToSend: Critere = {
        thematique: this.thematiqueControl.value ? this.thematiqueControl.value.id : null,
        procedureDecision: this.procedureDecisionsControl.value ? this.procedureDecisionsControl.value.id : null,
        session: this.sessionControl.value ? this.sessionControl.value.id : null,
        phase: 'T35',
        codeServiceDept: null,
        delegation: null,
        nbElemPerPage: 100000,
        domaine: null,
        hasReponseNontraite: null,
        natureOperation: null
      }

      this.searchEventEmitter.emit(critereToSend);
    }, 1000);
  }

  /**
* Triggers when a Procedure has been selected
* @param event the event containing the selected option
*/
  onSessionSelect(event: MatAutocompleteSelectedEvent) {
    const selectedPro = (event.option.value as ProcedureDecision);
    this.sessionControl.enable();
    this.sessionControl.setValue('');
    // this.sessionEventEmitter.emit(null);
    this.filteredSessions = GeneriqueListValeur.fillListSessions(selectedPro.code, this.sessions, this.sessionControl, this.sessionValidatorKey);
  }

  emptyCheckedList() {
    this._dossierService.idsCheckedDossier = [];
    this._dossierService.checkAll = null;
  }
}
