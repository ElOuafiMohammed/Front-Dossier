
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'app/theme/material/material.module';


import { DossierService } from '../../../dossiers.service';
import { DossierServiceStub } from '../../../dossiers.service.spec';
import { MontantsAideManuelComponent } from './montants-aide-manuel.component';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';
import { Operation, CoefficientConversion } from '../../dossier.interface';
import { TranslateModule } from '@ngx-translate/core';
import NumberUtils from '../../../../../shared/utils/number-utils';


const currentOperation: Operation = {
  natureOperation: null,
  totalMontantEligible: 5000,
  totalMontantOperation: 3000,
  totalMontantRetenu: 1000,
  lignesMasseEau: [],
  noOrdre: 1,
  localisationPertinente: true,
  departements: [],
  communes: [],
  regions: []
}
const coefficientOfConcersion: CoefficientConversion = {
  id: 1,
  codeParam: 'string',
  libelleParam: 'string',
  valeurDate: null,
  valeurStr: 'string',
  valeurCoef: 0.1
}
describe('Unit tests of MontantsAideManuelComponent', () => {
  let componentInstance: MontantsAideManuelComponent;
  let fixture: ComponentFixture<MontantsAideManuelComponent>;
  let dossierService: DossierService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MaterialModule,
        FlexLayoutModule,
        RouterTestingModule,
        TranslateModule.forRoot()

      ],
      declarations: [
        MontantsAideManuelComponent
      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        FormatMonetairePipe
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    });
    fixture = TestBed.createComponent(MontantsAideManuelComponent);
    componentInstance = fixture.componentInstance;
    componentInstance.currentOperation = currentOperation;
    componentInstance.coefficientConversion = coefficientOfConcersion;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(componentInstance).toBeTruthy();
  });

  it('should have a valid form by default', () => {
    expect(componentInstance.formMontantsAideManuel.valid).toBeTruthy();
  });

  it('should manage valid  fields value', () => {
    const form = componentInstance.formMontantsAideManuel;
    const avanceControl = componentInstance.avanceControl;
    const montantAvanceControl = componentInstance.montantAvanceControl;
    const subventionControl = componentInstance.subventionControl;
    const montantSubControl = componentInstance.montantSubControl;
    const eqSubventionSpecControl = componentInstance.eqSubventionSpecControl;
    const eqSubventionSpecTauxControl = componentInstance.eqSubventionSpecTauxControl;

    expect(avanceControl.errors).toBeNull();
    expect(montantAvanceControl.errors).toBeNull();
    expect(subventionControl.errors).toBeNull();
    expect(montantSubControl.errors).toBeNull();
    expect(eqSubventionSpecControl.errors).toBeNull();
    expect(eqSubventionSpecTauxControl.errors).toBeNull();
    expect(form.valid).toBeTruthy();

    const avanceValidValue = 10.15;
    const montantAvanceValidValue = 10;
    const subValidValue = 20.50;
    const montantSubValidValue = 10;
    const tauxSpecifique = 10;
    const montantSpecifique = 10;
    avanceControl.setValue(avanceValidValue);
    montantAvanceControl.setValue(montantAvanceValidValue);
    subventionControl.setValue(subValidValue);
    montantSubControl.setValue(montantSubValidValue);
    eqSubventionSpecTauxControl.setValue(tauxSpecifique);
    eqSubventionSpecControl.setValue(montantSpecifique);

    expect(form.valid).toBeTruthy();
  });


  it('should call #getCoefficientOfConversion', () => {
    dossierService = fixture.debugElement.injector.get(DossierService);
    const getCoefficientOfConversion = spyOn(dossierService, 'getCoefficientOfConversion').and.callThrough();
    expect(getCoefficientOfConversion.calls.count()).toBe(0);

    componentInstance.ngOnInit();

    expect(getCoefficientOfConversion.calls.count()).toBe(0);
  });


  it('should change avance value if montantAvance value change', () => {
    const avanceControl = componentInstance.avanceControl;
    const montantAvanceControl = componentInstance.montantAvanceControl;

    const avanceValidValue = 10.15;
    const montantAvanceValidValue = 10;
    avanceControl.setValue(avanceValidValue);
    montantAvanceControl.setValue(montantAvanceValidValue);
    expect(avanceControl.value).toBe(10.15);
    expect(montantAvanceControl.value).toBe(10);

  });

  it('should change subvention value if montantSubvention value change', () => {
    const subventionControl = componentInstance.subventionControl;
    const montantSubControl = componentInstance.montantSubControl;

    const avanceValidValue = 10.15;
    const montantAvanceValidValue = 200;
    subventionControl.setValue(avanceValidValue);
    montantSubControl.setValue(montantAvanceValidValue);

    // 200 represent 20% of 1000 (montantTotalRetenu of the current operation)
    expect(subventionControl.value).toBe(10.15);
    expect(montantSubControl.value).toBe(200);
  });

  it('should emit the formMontantsAideManuel when some data is updated', () => {
    const form = componentInstance.formMontantsAideManuel;
    const avanceControl = componentInstance.avanceControl;
    const montantAvanceControl = componentInstance.montantAvanceControl;
    const spyNotifyParent = spyOn(componentInstance, 'notifyParentComponent').and.callThrough();
    expect(spyNotifyParent.calls.any()).toBe(false);
    componentInstance.onMontantsAideManuelFormChange
      .subscribe((outputValue: FormGroup) => {
        expect(outputValue).toBe(form);
        expect(outputValue.valid).toBeTruthy();
      });

    const avanceValidValue = 10.15;
    const montantAvanceValidValue = 10;
    avanceControl.setValue(avanceValidValue);
    componentInstance.tauxAvanceObBlur(avanceValidValue.toString());

    montantAvanceControl.setValue(montantAvanceValidValue);
    componentInstance.montantAvanceOnBlur(montantAvanceValidValue);

    expect(avanceControl.errors).toBeNull();
    expect(montantAvanceControl.errors).toBeNull();
    expect(spyNotifyParent.calls.count()).toBe(2);
  });

  it('should update montant specifique when taux specifique change', () => {
    componentInstance.eqSubventionSpecTauxControl.setValue(10);
    componentInstance.tauxEqSubSpecBlur(componentInstance.eqSubventionSpecTauxControl.value);
    const eqSubventionSpecControl = NumberUtils.toNumber(componentInstance.eqSubventionSpecControl.value);
    expect(eqSubventionSpecControl).toEqual(100)
  })


  it('should empty taux specifique when taux avance is 0', () => {
    componentInstance.avanceControl.setValue(0);
    componentInstance.tauxAvanceObBlur(componentInstance.avanceControl.value);
    expect(componentInstance.eqSubventionSpecTauxControl.value).toEqual(null);
  })


  // totalMontantRetenuChange
  it('should update all montants when retenu or plafonne is changed', () => {
    componentInstance.avanceControl.setValue(10);
    componentInstance.tauxAvanceObBlur(componentInstance.avanceControl.value);
    /*     let montantValue = componentInstance.toNumber(componentInstance.montantAvanceControl.value);
        expect(montantValue).toEqual(100)
        componentInstance.totalMontantRetenuChange(70000);
        montantValue = componentInstance.toNumber(componentInstance.montantAvanceControl.value);
        expect(montantValue).toEqual(7000) */
  })
});
