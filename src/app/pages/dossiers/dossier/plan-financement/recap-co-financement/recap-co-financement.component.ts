import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import NumberUtils from 'app/shared/utils/number-utils';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';

import { ComponentViewRightMode, DossierService } from '../../../dossiers.service';
import {
  CoFinanceur,
  RecapitulatifCoFinaceur,
} from '../tableau-dynam-cofinancements/tableau-dynam-cofinancements-interface';
import { DossierFinancier } from './../../../dossiers.interface';

@Component({
  selector: 'siga-recap-co-financement',
  templateUrl: './recap-co-financement.component.html',
  styleUrls: ['./recap-co-financement.component.scss']
})
export class RecapCoFinancementComponent extends ComponentViewRightMode implements OnInit, OnChanges {
  @Input() coFinanceur: CoFinanceur[] = null;
  // @Input() currentOperation: Operation;
  formRecapCofinancement: FormGroup;
  dossierFinanceur: DossierFinancier;
  montantOperationInfo = '0';
  montantAutofinancement = 0;
  data: RecapitulatifCoFinaceur = {
    montantOperation: 0,
    montantAideAgence: 0,
    montantAidePrivee: 0,
    montantAidePublique: 0
  };
  @Output() onRecapCofinancementFormChange: EventEmitter<number> = new EventEmitter();

  get montantAideControl() { return this.formRecapCofinancement.get('montantAide'); }
  get aidePubliqueControl() { return this.formRecapCofinancement.get('aideExternePubliques'); }
  get aidePriveeControl() { return this.formRecapCofinancement.get('aideExternePrivees'); }
  get autoFinancementControl() { return this.formRecapCofinancement.get('autofinancement'); }
  get tauxAutoFinancementControl() { return this.formRecapCofinancement.get('tauxAutofinancement'); }
  get tauxAidePriveeControl() { return this.formRecapCofinancement.get('tauxAidePrivee'); }
  get tauxAidePubliqueControl() { return this.formRecapCofinancement.get('tauxAidePublic'); }
  get tauxMontantAideControl() { return this.formRecapCofinancement.get('tauxAideAgence'); }
  constructor(
    private _formBuilder: FormBuilder,
    private _dossierService: DossierService,
    private formatMonetairePipe: FormatMonetairePipe,
    private translate: TranslateService
  ) {
    super(_dossierService);
  }

  /**
   * Initializes the form and the specific inputs
   */
  ngOnInit() {
    this.formRecapCofinancement = this._formBuilder.group({
      montantAide: [{ value: 0, disabled: true }, []],
      aideExternePubliques: [{ value: 0, disabled: true }, []],
      aideExternePrivees: [{ value: 0, disabled: true }, []],
      autofinancement: [{ value: 0, disabled: true }, []],
      tauxAideAgence: [{ value: 0, disabled: true }],
      tauxAidePublic: [{ value: 0, disabled: true }],
      tauxAidePrivee: [{ value: 0, disabled: true }],
      tauxAutofinancement: [{ value: 0, disabled: true }],
    });
    if (this._dossierService) {
      this._dossierService.dossier$
        .subscribe(dossierReady => {
          if (this._dossierService.dossier) {
            if (this._dossierService.dossier.dossierFinancier) {
              this.data.montantAideAgence = NumberUtils.toNumber(this._dossierService.dossier.dossierFinancier.totalEquivalentSubventionAgence);
            }
            if (this._dossierService.dossier.planFinancementDossier && this._dossierService.dossier.planFinancementDossier.coFinanceurs) {

              this.calculMontantExterne(this._dossierService.dossier.planFinancementDossier.coFinanceurs);
              this.updateForm();
            }
          }
        });
    }

    // The form loads too fast for IE, so we encapsulate the whole process in a setTimeout(0) to reset the call stack
    setTimeout(() => { this.updateForm(); }, 100);

  }

  /**
  * update form component on change selected operation
  * @param changes detected intarface change
  */
  ngOnChanges(changes: SimpleChanges) {
    const currentCofinacer: any = changes && changes.coFinanceur ? changes.coFinanceur.currentValue : null;
    this.calculMontantExterne(currentCofinacer);
    this.updateForm();
  }

  getTotalOperation(value: number) {
    if (this._dossierService.dossierFinancier && this.data && this.formRecapCofinancement) {
      this._dossierService.dossier.dossierFinancier.totalMontantOperation = value;
      this.data.montantOperation = this._dossierService.dossier.dossierFinancier.totalMontantOperation;
      this.updateForm()
    }
  }


  getTotalEquivalentSubventionAgenceDeletOp(value: number) {
    if (this._dossierService.dossierFinancier) {
      this._dossierService.dossierFinancier.totalEquivalentSubventionAgence = value;
      this.data.montantAideAgence = this._dossierService.dossierFinancier.totalEquivalentSubventionAgence;
      this.updateForm()
    }
  }
  getTotalEquivalentSubventionAgence(value1: number, value2: number) {
    if (this._dossierService.dossierFinancier) {
      this._dossierService.dossierFinancier.totalEquivalentSubventionAgence += (value1 + value2);
      this.data.montantAideAgence = this._dossierService.dossierFinancier.totalEquivalentSubventionAgence;
      this.updateForm()
    }
  }
  calculMontantExterne(currentCofinacer: any) {
    let montantPublic = 0;
    let montantPrivee = 0;
    if (currentCofinacer) {
      currentCofinacer.forEach(element => {
        if (element.financeur && element.financeur.financeurPublic) {
          montantPublic += Math.ceil(NumberUtils.toNumber(element.montantAide));
        }
        if (element.financeur && !element.financeur.financeurPublic) {
          montantPrivee += Math.ceil(NumberUtils.toNumber(element.montantAide));
        }
      });
      this.data.montantAidePrivee = montantPrivee;
      this.data.montantAidePublique = montantPublic;
    }
  }

  /**
  * Patches the values from the service in the form
  */
  updateForm() {
    if (this.data && this.formRecapCofinancement) {
      const montantPublic = this.data.montantAidePublique ? this.data.montantAidePublique : 0;
      const montantPrivee = this.data.montantAidePrivee ? this.data.montantAidePrivee : 0;
      const aideAgence = this.data.montantAideAgence ? this.data.montantAideAgence : 0;
      const montantOperation = this.data.montantOperation ? this.data.montantOperation : 0;
      const montantAuto = montantOperation - (montantPrivee + montantPublic + aideAgence);
      this.montantAutofinancement = montantAuto;
      //Parfois le calcul retourne -0.55785454555 en affichant on affiche 0 par contre la vraie valeur est <0 
      // dans ces cas on mets 0 comme ça pas d'erreur
      if ((Math.ceil(montantAuto) === -0)) {
        this.montantAutofinancement = 0;
      }
      this.onRecapCofinancementFormChange.emit(this.montantAutofinancement);
      this.montantOperationInfo = this.formatMonetairePipe.transform(this.data.montantOperation);
      this.formRecapCofinancement.patchValue(
        {
          montantAide: this.formatMonetairePipe.transform(aideAgence),
          aideExternePubliques: this.formatMonetairePipe.transform(montantPublic),
          aideExternePrivees: this.formatMonetairePipe.transform(montantPrivee),
          autofinancement: this.formatMonetairePipe.transform(montantAuto),
          tauxAideAgence: montantOperation ? ((aideAgence / montantOperation) * 100).toFixed(2) : 0,
          tauxAidePublic: montantOperation ? ((montantPublic / montantOperation) * 100).toFixed(2) : 0,
          tauxAidePrivee: montantOperation ? ((montantPrivee / montantOperation) * 100).toFixed(2) : 0,
          tauxAutofinancement: montantOperation ? ((montantAuto / montantOperation) * 100).toFixed(2) : 0,
        },
        { emitEvent: false }
      );
    }
  }
}

