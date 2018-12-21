import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { ProcedureDecision, SessionDecision } from 'app/pages/dossiers/dossier/dossier.interface';
import { Critere } from 'app/pages/dossiers/recherche-dossier/recherche-dossier.interface';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { GenericVariablesSearch } from 'app/shared/generic.variables';
import { minSearchLength, SpinnerLuncher } from 'app/shared/methodes-generiques';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Phase, Thematique } from '../../create-dossier/create-dossier.interface';
import { LastDateAttribution } from '../../dossier/dossier.interface';
import { FrenchDateRegex } from '../../dossiers.interface';
import { DossierService } from '../../dossiers.service';



@Component({
  selector: 'siga-criteres-attribuer-aide',
  templateUrl: './criteres-attribuer-aide.component.html',
  styleUrls: ['./criteres-attribuer-aide.component.scss']
})
export class CriteresAttribuerAideComponent extends GenericVariablesSearch implements OnInit, OnChanges, OnDestroy {

  minSearchLength = 3;
  listPhase: string[];
  lastDateAttribution: LastDateAttribution;
  maxDate = new Date();
  dateRegex: RegExp = FrenchDateRegex;
  private unsubscribe = new Subject<void>();
  minDate = null;
  dateDerniereAttribution = null;

  /**
   * The object reprensenting the all criteres to search for
   */
  formCritere: FormGroup;

  get thematiqueControl() { return this.formCritere.get('thematique'); }
  get procedureDecisionsControl() { return this.formCritere.get('procedureDecision'); }
  get sessionControl() { return this.formCritere.get('session'); }
  get phaseControl() { return this.formCritere.get('phase'); }
  get dateControl() { return this.formCritere.get('dateAttribution'); }
  @Input() newAttributionDate = null;

  /**
   * Emits the Criteres selected to the parent component
   */
  @Output() searchEventEmitter: EventEmitter<Critere> = new EventEmitter();
  @Output() sessionEventEmitter: EventEmitter<SessionDecision> = new EventEmitter();
  @Output() dateAttributionEventEmitter: EventEmitter<any> = new EventEmitter();

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  constructor(
    private _formBuilder: FormBuilder,
    private _dossierService: DossierService,
    private datePipe: DatePipe,
    private spinnerLuncher: SpinnerLuncher
  ) { super() }

  /**
   * Initializes the form and the specific inputs
   */
  ngOnInit() {
    this.formCritere = this._formBuilder.group({
      thematique: ['', []],
      procedureDecision: ['', [Validators.required]],
      phase: ['', []],
      session: ['', []],
      dateAttribution: ['', []]
    }, { validator: this.formCritereValidator() });
    this.sessionControl.disable();
    setTimeout(() => {
      this.lastDateAttribution = this._dossierService.getLastDateOfAttribution();
      this.dateDerniereAttribution = this.lastDateAttribution ? this.datePipe.transform(this.lastDateAttribution.valeurDate, 'dd/MM/yyyy') : null;
      this.minDate = this.lastDateAttribution ? this.lastDateAttribution.valeurDate : null;
    }, this._dossierService.delay);

    this.updateFormData(this._dossierService.formAttribuerAides);
    this.setControlDate();
  }

  ngOnChanges() {
    setTimeout(() => {
      this._dossierService.getApplicationInfo();
    }, this._dossierService.delay);
    if (this.newAttributionDate) {
      this.dateDerniereAttribution = this.datePipe.transform(this.newAttributionDate.dateAttributionAide, 'dd/MM/yyyy');
      this.minDate = this.newAttributionDate.dateAttributionAide;
    }
    if (this.formCritere && this.thematiques) {
      this.filteredThematiques = GeneriqueListValeur.filtringList(this.thematiques, this.thematiqueControl, this.thematiqueValidatorKey, minSearchLength, 'listValeur');
    }
    if (this.formCritere && this.procedureDecisions) {
      this.filteredProcedures = GeneriqueListValeur.filtringList(this.procedureDecisions, this.procedureDecisionsControl, this.procedureValidatorKey, minSearchLength, 'listValeur');
    }
    if (this.formCritere && this.sessions) {
      // Set synchronous validator once the data is available
      this.sessionControl.setValidators([
        GeneriqueListValeur.sigaAutocompleteValidatorFactory(this.sessions, this.sessionValidatorKey)
      ]);
    }
    if (this.formCritere && this.phases) {
      this.filteredPhases = GeneriqueListValeur.filtringList(this.phases, this.phaseControl, this.phaseValidatorKey, minSearchLength, 'listValeur');
    }
  }

  /**
 * Control sur la validié de la date
 * Véification sur la longuer de la date saisie :
 * exemple 010319999 et 01/03/19999
 * ne fonctionnent pas
 */
  setControlDate() {
    this.formCritere.get('dateAttribution').valueChanges.pipe(takeUntil(this.unsubscribe))
      .subscribe((value) => {
        if (value && value._i && !(value._i instanceof Object)) {
          // vérifie que la date respecte le format jj/mm/aaaa
          if (!this.dateRegex.test(value._i)) {
            this.dateControl.setErrors({ 'wrongFormat': true });
          }
        }
        if (value) {
          if (!this.dateControl.hasError('wrongFormat') && !this.dateControl.hasError('matDatepickerParse') &&
            !this.dateControl.hasError('matDatepickerMin') && !this.dateControl.hasError('matDatepickerMax')) {
            this.dateAttributionEventEmitter.emit(value)
          } else {
            this.dateAttributionEventEmitter.emit(null);
          }
        } else {
          this.dateAttributionEventEmitter.emit(null);
        }
      })
  }
  /**
 * Custom validator that verifies at least one of the fields in the form is filled
 */
  formCritereValidator() {
    return (group: FormGroup) => {
      if (this.formCritere && this.thematiqueControl.value === ''
        && this.procedureDecisionsControl.value === ''
        && this.phaseControl.value === ''
      ) {
        return { 'noCritereFieldInputed': true }
      }
      return null;
    }
  }

  dateAttributionSelected(event) {
    if (event) {
      this.dateDerniereAttribution = moment(event._d).utc().format('DD/MM/YYYY');
      this.dateAttributionEventEmitter.emit(event)
    } else {
      this.dateAttributionEventEmitter.emit(null);
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

  clearDisplayedDataSession() {
    this.sessionControl.setValue('');
  }

  displayPhase(phase: Phase): string | undefined {
    if (phase) {
      return `${phase.code}`;
    }
  }

  clearDisplayedDataProcedure() {
    this.procedureDecisionsControl.setValue('');
    this.procedureDecisionsControl.setErrors({ required: true });
    this.procedureDecisionsControl.markAsTouched();
    this.sessionControl.setValue(null);
    this.sessionControl.disable();
  }

  onSessionSelect(event: MatAutocompleteSelectedEvent) {
    const selectedPro = (event.option.value as ProcedureDecision);
    this.sessionControl.enable();
    this.sessionControl.setValue('');
    this.filteredSessions = GeneriqueListValeur.fillListSessions(selectedPro.code, this.sessions, this.sessionControl, this.sessionValidatorKey);
  }

  /**
  * Patches the values from the service in the form
  */
  updateFormData(formDataRecherche: FormGroup) {
    if (formDataRecherche != null) {
      this.formCritere.patchValue(
        {
          thematique: formDataRecherche.get('thematique').value,
          procedureDecision: formDataRecherche.get('procedureDecision').value,
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

  onSubmit(emptyStoredValues: boolean) {
    this.spinnerLuncher.show();
    this.listPhase = [];
    this.submitted = true;
    if (emptyStoredValues) {
      this.emptyCheckedList();
    }
    if (this.phaseControl.value) {
      this.listPhase.push(this.phaseControl.value.code);
    } else {
      this.listPhase = ['A01', 'A02'];
    }
    this._dossierService.formAttribuerAides = this.formCritere;
    const critereToSend: Critere = {
      thematique: this.thematiqueControl.value ? this.thematiqueControl.value.id : null,
      procedureDecision: this.procedureDecisionsControl.value ? this.procedureDecisionsControl.value.id : null,
      session: this.sessionControl.value ? this.sessionControl.value.id : null,
      dateAttribution: this.dateControl.value ? this.dateControl.value._d : null,
      nbElemPerPage: 100000,
      listPhase: this.listPhase
    }
    this.searchEventEmitter.emit(critereToSend);
  }
  emptyCheckedList() {
    this._dossierService.idsCheckedDossier = [];
    this._dossierService.checkAll = null;
  }

  /**
 * Destroys pending subscriptions
 */
  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe.next();
      this.unsubscribe.complete();
    }
  }
}
