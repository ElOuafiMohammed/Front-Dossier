import { AfterViewInit, Component, EventEmitter, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ProcedureDecision } from 'app/pages/dossiers/dossier/dossier.interface';
import { NumberAnneeSDRegex, NumberNumeroSDRegex } from 'app/pages/dossiers/dossiers.interface';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { GenericVariablesSearch } from 'app/shared/generic.variables';
import { minSearchLength, SpinnerLuncher } from 'app/shared/methodes-generiques';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';

import { DossierService } from '../../../../dossiers.service';
import { CritereSessionDecision } from '../../../../recherche-dossier/recherche-dossier.interface';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'critere-card-session-decision',
  templateUrl: './critere-card-session-decision.component.html',
  styleUrls: ['./critere-card-session-decision.component.scss']
})
export class CritereCardSessionDecisionComponent extends GenericVariablesSearch implements OnInit, OnChanges, AfterViewInit {

  /**
  * The object reprensenting the all criteres to search for
  */
  formCritere: FormGroup;

  get procedureDecisionControl() { return this.formCritere.get('type'); }
  get anneeControl() { return this.formCritere.get('annee'); }
  get numeroControl() { return this.formCritere.get('numero'); }

  /**
   * Emits the Criteres selected to the parent component
   */
  @Output() searchEventEmitter: EventEmitter<CritereSessionDecision> = new EventEmitter();

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  /**
   * Constructor
   * @param _formBuilder used to create the form
   * @param _dossierService used to manage dossiers
   */
  constructor(private _formBuilder: FormBuilder,
    private _dossierService: DossierService,
    public translate: TranslateService,
    private spinnerLuncher: SpinnerLuncher) {
    super()
  }

  ngOnInit() {
    this.formCritere = this._formBuilder.group({
      type: ['', []],
      annee: ['', [Validators.pattern(NumberAnneeSDRegex)]],
      numero: ['', [Validators.pattern(NumberNumeroSDRegex)]]
    }, {});
    this.procedureDecisionControl.valueChanges.subscribe((data) => {
    });
  }

  ngOnChanges() {
    if (this.formCritere && this.procedureDecisions) {
      // tslint:disable-next-line:max-line-length
      this.filteredProcedures = GeneriqueListValeur.filtringList(this.procedureDecisions, this.procedureDecisionControl, this.procedureValidatorKey, minSearchLength, 'listValeur');
    }
  }

  /**
   * Manages how a procedureDecision should be displayed in the input
   * @param procedureDecision a given ProcedureDecision to be formatted
   */
  displayType(procedureDecision: ProcedureDecision) {
    if (procedureDecision) {
      return `${procedureDecision.code} - ${procedureDecision.libelle}`;
    }
  }

  ngAfterViewInit() {
    // wait until destroy dossier component
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
          type: this.procedureDecisionControl.value.code,
          annee: this.anneeControl.value,
          numero: this.numeroControl.value,
        }, { emitEvent: false }
      );
      this.onSubmit();
    }
  }
  onSubmit() {
    this.spinnerLuncher.show();
    const critereToSend: CritereSessionDecision = {
      type: this.procedureDecisionControl.value && this.procedureDecisionControl.value.code ? this.procedureDecisionControl.value.code : null,
      annee: this.anneeControl.value ? this.anneeControl.value : null,
      numero: this.numeroControl.value ? this.numeroControl.value : null,
      pageAAficher: null,
      nbElemPerPage: null,
    }
    this.searchEventEmitter.emit(critereToSend);
  }

}
