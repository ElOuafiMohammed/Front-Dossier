import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatRadioChange } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { minSearchLength } from 'app/shared/methodes-generiques';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import NumberUtils from 'app/shared/utils/number-utils';
import * as moment from 'moment';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Dispositif, Dossier, FourDigitRegex } from '../../dossiers.interface';
import { ComponentViewRightMode, DossierService } from '../../dossiers.service';
import { SessionDecision, TypeDispositif, Typologie } from '../dossier.interface';


@Component({
  selector: 'siga-previsionnel',
  templateUrl: './previsionnel.component.html',
  styleUrls: ['./previsionnel.component.scss'],
})
export class PrevisionnelComponent extends ComponentViewRightMode implements OnInit, OnDestroy {
  @Output() onPreDossierFormChange = new EventEmitter<FormGroup>();

  private unsubscribe = new Subject<void>();
  /**
   * The object reprensenting the whole dossier to be created
   */
  formPrevisionnel: FormGroup;

  sessions: SessionDecision[] = null;
  sessionIsNotValid = false;
  filteredSessions: Observable<SessionDecision[]>;
  readonly sessionValidatorKey = 'sessionNotFound';
  get sessionControl() { return this.formPrevisionnel.get('session'); }

  get anneeControl() { return this.formPrevisionnel.get('annee'); }

  typeDispositifList: TypeDispositif[] = null;
  filteredTypesDispositif: Observable<TypeDispositif[]>;
  readonly typeDispositifValidatorKey = 'typeDispositifNotFound';

  dispositif: Dispositif = null;
  message: string;

  minSearchLength = 3;
  typologies: Typologie[] = null;
  get typologieControl() { return this.formPrevisionnel.get('typologie'); }

  phaseSubscription: Subscription = null;
  administratifSubscription: Subscription = null;
  dossierReadySubscription: Subscription = null;

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  constructor(
    private _formBuilder: FormBuilder,
    private _dossierService: DossierService,
    public translate: TranslateService
  ) {
    super(_dossierService);

    this.phaseSubscription = _dossierService.dossierPhase$
      .subscribe(phase => {
        if (phase && this.formPrevisionnel) {
          this.formPrevisionnel.disable({ emitEvent: false });
        }
        if (!phase && this.formPrevisionnel) {
          this.formPrevisionnel.enable({ emitEvent: false });
        }
      });

    this.administratifSubscription = _dossierService.dossierAdministratif$
      .subscribe(administratif => {
        if (administratif && this.formPrevisionnel) {
          this.formPrevisionnel.disable({ emitEvent: false });
        }
        if (!administratif && this.formPrevisionnel) {
          this.formPrevisionnel.enable({ emitEvent: false });
        }
      });

    // Loads the data the first time the DossierComponent is loaded (first navigation or F5)
    this.dossierReadySubscription = _dossierService.dossier$
      .subscribe(dossierReady => {
        if (_dossierService.dossier && _dossierService.dossier.preDossier) {
          // The form loads too fast for IE, so we encapsulate the whole process in a setTimeout(0) to reset the call stack
          setTimeout(() => {
            this.updateFormData(_dossierService.dossier);

          }, 0);
        }
      });
  }

  ngOnInit() {
    this.formPrevisionnel = this._formBuilder.group({
      annee: [null, [Validators.pattern(FourDigitRegex)]],
      session: [null, []],
      id: [null, []],
      typologie: [null, []],
    }
      , { validator: [this.formPrevisionnelValidator()] }
    );



    this._dossierService.getSessionPrevisionnel()
      .subscribe(sessions => {
        this.sessions = sessions.filter(session => session.type === 'CI');
        this.filteredSessions = GeneriqueListValeur.filtringList(this.sessions, this.sessionControl, this.sessionValidatorKey, minSearchLength, 'sessionDecision');
      });

    //  setTimeout(() => {
    this.typologies = this._dossierService.getTypologies();
    if (this._dossierService.dossier && this._dossierService.dossier.preDossier) {
      this.updateFormData(this._dossierService.dossier);
    }
    //  }, this._dossierService.delay);

    this.setControlListenners();
  }

  formPrevisionnelValidator() {
    return (group: FormGroup) => {

      return null;
    }
  }


  // TODO - REWORK : Respect ES6 format
  formateNumeroIncrement(num, size) {
    let s = num + '';
    while (s.length < size) { s = '0' + s; }
    return s;
  }

  /**
   * Patches the values from the service in the form
   */
  updateFormData(dossier: Dossier) {
    // Manage radio-button value reference manually
    if (dossier.preDossier.typologie && this.typologies) {
      dossier.preDossier.typologie = this.typologies.find(typologie => typologie.id === dossier.preDossier.typologie.id);
    }
    this.formPrevisionnel.patchValue(
      {
        annee: dossier.preDossier.anneeEngagPrevi ? dossier.preDossier.anneeEngagPrevi : dossier.preDossier.sessionDecision ? dossier.preDossier.sessionDecision.annee : null,
        session: dossier.preDossier.sessionDecision,
        typologie: dossier.preDossier.typologie,
      },
      { emitEvent: false }
    );

    if (this.sessionControl.value && moment(new Date()).isAfter(moment(this.sessionControl.value.date))) {
      this.sessionIsNotValid = true
    }
  }

  setControlListenners() {
    this.anneeControl.valueChanges.pipe(takeUntil(this.unsubscribe))
      .subscribe((annee: number) => {
        // Reset the Session control value
        this.sessionControl.setValue(null, { emitEvent: false });

        if (annee && annee.toString().length === 4 && annee < 1950) {
          this.anneeControl.setErrors({ 'matDatepickerMin': true });
        }
        if (annee && annee.toString().length === 4 && annee < new Date().getFullYear()) {
          this.anneeControl.setErrors({ 'matDatepickerPrev': true });
        }
        if (annee && annee.toString().length === 4 && annee > 2050) {
          this.anneeControl.setErrors({ 'matDatepickerMax': true });
        }
        this.notifyParentComponent();
      });

    this.sessionControl.valueChanges.pipe(takeUntil(this.unsubscribe))
      .subscribe((session: SessionDecision) => {
        this.notifyParentComponent();
      })
  }

  /**
  * Triggers when a session has been selected
  * @param event the event containing the selected option
  */
  onSessionSelect(event: MatAutocompleteSelectedEvent) {
    const selectedYear = (event.option.value as SessionDecision).annee;
    this.anneeControl.setValue(selectedYear, { emitEvent: false });
    this.notifyParentComponent();
  }

  onTypologieSelectOption(event: MatRadioChange) {
    this.notifyParentComponent();
  }

  /**
   * Sends back the updated form to the parent component to manage validation
   */
  notifyParentComponent() {
    this.onPreDossierFormChange.emit(this.formPrevisionnel);
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

  displayTypeDispositif(typeDispositif: TypeDispositif): string | undefined {
    if (typeDispositif) {
      return `${typeDispositif.code}`;
    }
  }
  /**
    * Manages when cellules  will initialised with blanc
    * @param session a given SessionDecision to be formatted
    */
  ajusterInisialiserSaisie(event) {
    if (this.sessionControl.value && new Date().getFullYear() > this.anneeControl.value) {
      this.sessionControl.setValue('');
      this.anneeControl.setValue('');
    } else {
      this.sessionControl.setValue('');
    }
    this.sessionControl.markAsDirty();
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
    if (this.phaseSubscription) {
      this.phaseSubscription.unsubscribe();
    }
    if (this.dossierReadySubscription) {
      this.dossierReadySubscription.unsubscribe();
    }
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
