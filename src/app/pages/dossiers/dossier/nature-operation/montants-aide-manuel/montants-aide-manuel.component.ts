import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import NumberUtils from 'app/shared/utils/number-utils';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';
import { Subject, Subscription } from 'rxjs';

import { ComponentViewRightMode, DossierService } from '../../../dossiers.service';
import { CoefficientConversion, Operation } from '../../dossier.interface';


/**
 * Component that update SIGA Inputs Aides Manuel
 */
@Component({
  selector: 'siga-montants-aide-manuel',
  templateUrl: './montants-aide-manuel.component.html',
  styleUrls: ['./montants-aide-manuel.component.scss'],
})

export class MontantsAideManuelComponent extends ComponentViewRightMode implements OnInit, OnDestroy, OnChanges {

  private unsubscribe = new Subject<void>();
  /**
   * Current selected operation
 */
  coefficientConversion: CoefficientConversion;

  @Input() currentOperation: Operation;
  @Output() onMontantsAideManuelFormChange = new EventEmitter<FormGroup>();
  regex = new RegExp(/^0|[^0-9 ]+/g);
  tauxAvance = 0;
  tauxSubvention = 0;
  viewLineSpec = false;
  viewEquiSubSpec = false;
  /**
* The object reprensenting the whole dispositif to be created
*/
  formMontantsAideManuel: FormGroup;
  get avanceControl() { return this.formMontantsAideManuel.get('tauxAvance'); }
  get montantAvanceControl() { return this.formMontantsAideManuel.get('montantAvance'); }
  get equivalentSubControl() { return this.formMontantsAideManuel.get('montantAvanceEqSubvention'); }
  get subventionControl() { return this.formMontantsAideManuel.get('tauxSubvention'); }
  get montantSubControl() { return this.formMontantsAideManuel.get('montantSubvention'); }
  get eqSubventionSpecTauxControl() { return this.formMontantsAideManuel.get('tauxSpecifique'); }
  get eqSubventionSpecControl() { return this.formMontantsAideManuel.get('montantEqSubventionSpecifique'); }

  phaseSubscription: Subscription = null;
  administratifSubscription: Subscription = null;
  /**
 * Component dependencies
 * @ param _formBuilder used to create the form
 * @ param _dossierService used to manage dossiers
 */
  constructor(
    private _formBuilder: FormBuilder,
    private _dossierService: DossierService,
    private _formatMonetairePipe: FormatMonetairePipe,
    public translate: TranslateService
  ) {
    super(_dossierService);

    this.phaseSubscription = _dossierService.dossierPhase$
      .subscribe(phase => {
        if (phase && this.formMontantsAideManuel && this.formMontantsAideManuel.enabled) {
          this.formMontantsAideManuel.disable({ emitEvent: false });
        }
        if (!phase && this.formMontantsAideManuel && this.formMontantsAideManuel.disabled) {
          this.formMontantsAideManuel.enable({ emitEvent: false });
          this.equivalentSubControl.disable({ emitEvent: false });

        }
      });

    this.administratifSubscription = _dossierService.dossierAdministratif$
      .subscribe(administratif => {
        if (administratif && this.formMontantsAideManuel) {
          this.formMontantsAideManuel.disable({ emitEvent: false });
        }
        if (!administratif && this.formMontantsAideManuel) {
          this.formMontantsAideManuel.enable({ emitEvent: false });
        }
      });
  }

  /**
   * Initializes the form and the specific inputs
   */
  ngOnInit() {
    this.formMontantsAideManuel = this._formBuilder.group({
      tauxAvance: [0, []],
      montantAvance: [0, []],
      montantAvanceEqSubvention: [{ value: 0, disabled: true }, []],
      coefficientConvert: [{ value: 0, disabled: true }, []],
      tauxSubvention: [0, []],
      montantSubvention: [0, []],
      tauxSpecifique: ['', []],
      montantEqSubventionSpecifique: [{ value: 0, disabled: true }, []]
    });
    this.tauxAvance = this.currentOperation.tauxAvance;
    this.tauxSubvention = this.currentOperation.tauxSubvention;

    setTimeout(() => {
      this.coefficientConversion = this._dossierService.getCoefficientOfConversion()
    }, this._dossierService.delay);

    this.updateFormData(this.currentOperation)
    this.setControlListenners();
  }

  /**
 * update form component on change selected operation
  * @param changes detected intarface change
 */
  ngOnChanges(changes: SimpleChanges) {
    const currentOperation: SimpleChange = changes.currentOperation;
    this.currentOperation = currentOperation.currentValue;
    this.viewLineSpec = false;
    this.viewEquiSubSpec = false;
    this.updateFormData(this.currentOperation)
  }

  setControlListenners() {
  }

  getTotalForCalcul(): number {
    if (this.currentOperation.totalMontantRetenuPlafonne > 0) {
      return this.currentOperation.totalMontantRetenuPlafonne
    } else {
      return this.currentOperation.totalMontantRetenu
    }
  }

  tauxAvanceObBlur(avance: string) {
    if (avance.toString() === '') {
      this.resetAvanceInputs();
    }
    if (avance) {
      const myAavance = Number(avance.toString().replace(',', '.'));
      let cal = 0;
      if (isNaN(myAavance)) {
        this.avanceControl.setErrors({ 'avanceHasToBeANumber': true });
      }
      if (myAavance > 100) {
        this.avanceControl.setErrors({ 'avanceCannotBeOver100': true });
      }
      if (!this.avanceControl.errors && this.coefficientConversion) {
        this.appearLineSpecManagement(myAavance);
        cal = (this.getTotalForCalcul() / 100) * this.avanceControl.value;

        this.montantAvanceControl.setValue(this._formatMonetairePipe.transform(Math.ceil(cal)), { emitEvent: false });
        if (!this.montantAvanceControl.errors) {
          cal = (NumberUtils.toNumber(this.montantAvanceControl.value) * this.coefficientConversion.valeurCoef);
          this.equivalentSubControl.setValue(this._formatMonetairePipe.transform(Math.ceil(cal)), { emitEvent: false });
        }
      }
    }
    this.notifyParentComponent();
  }

  tauxEqSubSpecBlur(tauxSpec: string) {
    if (tauxSpec === null || (tauxSpec != null && tauxSpec.toString() === '')) {
      this.eqSubventionSpecControl.setValue(0);
      this.viewEquiSubSpec = false;
    }
    if (tauxSpec) {
      const taux = Number(tauxSpec.toString().replace(',', '.'));
      if (isNaN(taux)) {
        this.eqSubventionSpecTauxControl.setErrors({ 'eqSubSpecHasToBeANumber': true });
      }
      if (taux > 100) {
        this.eqSubventionSpecTauxControl.setErrors({ 'eqSubSpecCannotBeOver100': true });
      }
      if (!this.eqSubventionSpecTauxControl.errors) {
        const cal = (this.getTotalForCalcul() * taux) / 100;
        this.eqSubventionSpecControl.setValue(this._formatMonetairePipe.transform(Math.ceil(cal)), { emitEvent: false });
        if (taux === 0) {
          this.eqSubventionSpecTauxControl.setValue('', { emitEvent: false });
          this.viewEquiSubSpec = false;
        } else {
          this.viewEquiSubSpec = true;
        }
      }
    }
    this.notifyParentComponent();
  }


  montantAvanceOnBlur(montantAvance: any) {
    if (typeof montantAvance !== 'number') {
      montantAvance = NumberUtils.toNumber(montantAvance);
    }

    this.montantAvanceControl.setValue(this._formatMonetairePipe.transform(montantAvance), { emitEvent: false });
    if (montantAvance.toString() === '0' && this.montantAvanceControl.value !== 0) {
      this.resetAvanceInputs();
    }
    if (montantAvance) {
      if (montantAvance > this.getTotalForCalcul()) {
        this.montantAvanceControl.setErrors({ 'montantCannotBeOverTotalMontantRetenu': true });
        this.montantAvanceControl.markAsTouched();
      }
      let cal = 0;
      if (!this.montantAvanceControl.errors && this.coefficientConversion) {
        cal = (montantAvance * this.coefficientConversion.valeurCoef);

        this.equivalentSubControl.setValue(this._formatMonetairePipe.transform(Math.ceil(cal)), { emitEvent: false });
        // cal = 0;

        cal = (montantAvance * 100 / this.getTotalForCalcul());
        if (this.avanceControl.value !== cal.toString() && !isNaN(cal)) {
          this.avanceControl.setValue(this.limitDecimalTo2(cal), { emitEvent: false });
          if (this.limitDecimalTo2(cal) > 0) {
            this.viewLineSpec = true;
          } else {
            this.viewLineSpec = false;
          }
        }
      }
    }
    this.notifyParentComponent();
  }

  subventionOnBlur(subvention: any) {
    if (subvention.toString() === '') {
      this.resetSubventionInputs();
    }
    if (subvention) {
      const mySubvention = Number(subvention.toString().replace(',', '.'));
      let cal = 0;
      if (isNaN(mySubvention)) {
        this.subventionControl.setErrors({ 'subventionHasToBeANumber': true });
      }
      if (mySubvention > 100) {
        this.subventionControl.setErrors({ 'subventionCannotBeOver100': true });
      }
      if (!this.subventionControl.errors) {
        cal = (this.getTotalForCalcul() / 100) * this.subventionControl.value;
        this.montantSubControl.setValue(this._formatMonetairePipe.transform(Math.ceil(cal)), { emitEvent: false });
      }
    }
    this.notifyParentComponent();

  }

  montantSubventionOnBlur(montantSub: any) {
    if (typeof montantSub !== 'number') {
      montantSub = NumberUtils.toNumber(montantSub);
    }
    this.montantSubControl.setValue(this._formatMonetairePipe.transform(montantSub), { emitEvent: false });
    if (montantSub.toString() === '0' && this.montantSubControl.value !== 0) {
      this.resetSubventionInputs();
    }
    if ((montantSub.toString()).substring(0, 1) === '0') {
      this.resetSubventionInputs();
    }
    if (montantSub) {
      if (montantSub > this.getTotalForCalcul()) {
        this.montantSubControl.setErrors({ 'montantCannotBeOverTotalMontantRetenu': true });
        this.montantSubControl.markAsTouched();
      }
      let cal = 0;
      if (!this.montantSubControl.errors) {
        cal = (montantSub * 100 / this.getTotalForCalcul());
        if (this.subventionControl.value !== cal.toString() && !isNaN(cal)) {
          this.subventionControl.setValue(this.limitDecimalTo2(cal), { emitEvent: false });
        }
      }
    }
    this.notifyParentComponent();

  }

  /**
  * Patches the values from the service in the form
  */
  updateFormData(currentOperation: Operation) {

    if (currentOperation && this.formMontantsAideManuel) {

      this.equivalentSubControl.disable();
      this.eqSubventionSpecControl.disable();
      if (this.viewRight || this.viewAdministratif) {
        this.avanceControl.disable();
        this.montantAvanceControl.disable();

        this.formMontantsAideManuel.disable({ emitEvent: false });

      } else {
        // Allow to reset the "clear" icons
        this.montantAvanceControl.enable();
        this.montantSubControl.enable();
      }

      this.formMontantsAideManuel.patchValue(
        {
          tauxAvance: this.limitDecimalTo2(currentOperation.tauxAvance),
          montantAvance: currentOperation.montantAvance ? this._formatMonetairePipe.transform(Math.ceil(currentOperation.montantAvance)) : 0,
          montantAvanceEqSubvention: this._formatMonetairePipe.transform(Math.ceil(currentOperation.montantAvanceEqSubvention)),
          coefficientConvert: this.coefficientConversion ? this.coefficientConversion.valeurCoef : 0,
          tauxSubvention: this.limitDecimalTo2(currentOperation.tauxSubvention),
          montantSubvention: currentOperation.montantSubvention ? this._formatMonetairePipe.transform(Math.ceil(currentOperation.montantSubvention)) : 0,
          tauxSpecifique: currentOperation.tauxSpecifique != null ? this.limitDecimalTo2(currentOperation.tauxSpecifique) : null,
          montantEqSubventionSpecifique: currentOperation.montantEqSubventionSpecifique ?
            this._formatMonetairePipe.transform(Math.ceil(currentOperation.montantEqSubventionSpecifique)) : 0
        },
        { emitEvent: false }
      );
    }
    if (currentOperation.tauxAvance > 0) {
      this.viewLineSpec = true;
      if (currentOperation.tauxSpecifique >= 0 && currentOperation.tauxSpecifique != null) {
        this.viewEquiSubSpec = true;
      }
    }

  }

  /**
  * change montants on change total montant retenu
  * @param totalMontantRetenu value of total montant retenu of the current operation
  */
  totalMontantRetenuChange(totalMontantRetenu: { value: number, typeMontant: string }) {
    if (totalMontantRetenu.typeMontant === 'plafonne') {
      this.currentOperation.totalMontantRetenuPlafonne = totalMontantRetenu.value;
    } else {
      this.currentOperation.totalMontantRetenu = totalMontantRetenu.value;
    }
    if (this.formMontantsAideManuel) {
      let cal = 0;
      if (this.avanceControl.value && !this.avanceControl.errors) {
        cal = (totalMontantRetenu.value / 100) * this.avanceControl.value;
        this.montantAvanceControl.setValue(this._formatMonetairePipe.transform(Math.ceil(cal)), { emitEvent: false });
        if (totalMontantRetenu.value !== 0 && this.coefficientConversion) {
          const equiSub = (cal * this.coefficientConversion.valeurCoef);
          this.equivalentSubControl.setValue(this._formatMonetairePipe.transform(Math.ceil(equiSub)), { emitEvent: false });
        } else {
          this.equivalentSubControl.setValue(0);
        }
      }

      if (this.subventionControl.value && !this.subventionControl.errors) {
        cal = (totalMontantRetenu.value / 100) * this.subventionControl.value;
        this.montantSubControl.setValue(this._formatMonetairePipe.transform(Math.ceil(cal)), { emitEvent: false });
      }
      if (this.eqSubventionSpecTauxControl.value > 0) {
        const montantSpec = (totalMontantRetenu.value * this.eqSubventionSpecTauxControl.value) / 100;
        this.eqSubventionSpecControl.setValue(this._formatMonetairePipe.transform(Math.ceil(montantSpec)), { emitEvent: false });
      }
      this.notifyParentComponent();
    }
  }

  /**
   * Sends back the updated form to the parent component to manage validation
  */
  notifyParentComponent() {
    setTimeout(() => {
      this.onMontantsAideManuelFormChange.emit(this.formMontantsAideManuel);
    }, 10);
  }

  resetAvanceInputs() {
    this.avanceControl.setValue(0);
    this.montantAvanceControl.setValue(0);
    this.equivalentSubControl.setValue(0);
    this.viewLineSpec = false;
    this.viewEquiSubSpec = false;
    this.eqSubventionSpecControl.setValue(0);
    this.eqSubventionSpecTauxControl.setValue('');
  }

  resetSubventionInputs() {
    this.subventionControl.setValue(0);
    this.montantSubControl.setValue(0);
  }


  /**
 *Character no supported
 * @param control
 */
  onlyNumber(control: any, event?: any) {
    const positionInit = event && (event.target !== 0) ? event.target.selectionStart : 0;
    control.setValue(NumberUtils.onlyNumber(control.value));
    if (event && event.target) {
      event.target.selectionEnd = positionInit - 1;
    }

  }

  limitDecimalTo2(value: any): number {
    const factor = Math.pow(10, 2);
    return Math.round(value * factor) / factor;
  }

  onlyDecimalTaux(value: any) {
    if (value) {
      this.avanceControl.setValue(NumberUtils.onlyDecimalLimit(value, 3, 2));
    }
  }

  onlyDecimalTauxSubvention(value: any) {
    if (value) {
      this.subventionControl.setValue(NumberUtils.onlyDecimalLimit(value, 3, 2));
    }
  }

  onlyDecimalTauxSpec(value: any) {
    if (value) {
      this.eqSubventionSpecTauxControl.setValue(NumberUtils.onlyDecimalLimit(value, 3, 2));
    }
  }

  appearLineSpecManagement(myAavance: number) {
    if (myAavance > 0) {
      this.viewLineSpec = true;
    } else {
      this.viewLineSpec = false;
      this.eqSubventionSpecTauxControl.setValue('');
      this.viewEquiSubSpec = false;
      this.eqSubventionSpecControl.setValue(0);
    }
  }

  sigaFormatNumber(control: any, event: any) {
    this.onlyNumber(control, event)
  }
  ngOnDestroy() {
    this.phaseSubscription.unsubscribe();
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
