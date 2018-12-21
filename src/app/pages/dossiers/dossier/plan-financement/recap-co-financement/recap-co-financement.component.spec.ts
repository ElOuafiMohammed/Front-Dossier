import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterTestingModule } from '@angular/router/testing';
import { RecapCoFinancementComponent } from './recap-co-financement.component';
import { DossierService } from '../../../dossiers.service';
import { DossierServiceStub } from '../../../dossiers.service.spec';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';
import { RecapitulatifCoFinaceur, CoFinanceur } from '../tableau-dynam-cofinancements/tableau-dynam-cofinancements-interface';
import { DossierFinancier } from '../../../dossiers.interface';
import NumberUtils from 'app/shared/utils/number-utils';
describe('RecapCoFinancementComponent', () => {
  let component: RecapCoFinancementComponent;
  let fixture: ComponentFixture<RecapCoFinancementComponent>;
  const data: RecapitulatifCoFinaceur = {
    montantOperation: 1000,
    montantAideAgence: 500,
    montantAidePrivee: 500,
    montantAidePublique: 500
  };
  const dossierFinancier: DossierFinancier = {
    dispositionsFinancieres: null,
    engagementsParticuliers: null,
    modaliteReductions: null,
    modaliteVersement: null,
    totalMontantOperation: 10000,
    totalEquivalentSubventionAgence: 400
  };
  const cofinanceur = {
    id: 20,
    precision: '',
    montantAide: 2500,
    tauxAide: 20,
    financeur: {
      id: 1,
      code: 'F1',
      libelle: 'FINANCEUR N1 privee',
      financeurPublic: false,
      disable: false

    }
  }
  const cofinaceur: CoFinanceur[] = [{
    id: 20,
    precision: '',
    montantAide: 2500,
    tauxAide: 20,
    financeur: {
      id: 1,
      code: 'F1',
      libelle: 'FINANCEUR N1 privee',
      financeurPublic: false,
      disable: false

    }
  },
  {
    id: 20,
    precision: '',
    montantAide: 2500,
    tauxAide: 20,
    financeur: {
      id: 1,
      code: 'F1',
      libelle: 'FINANCEUR N1 privee',
      financeurPublic: false,
      disable: false

    }
  },
  {
    id: 20,
    precision: '',
    montantAide: 2500,
    tauxAide: 20,
    financeur: {
      id: 1,
      code: 'F1',
      libelle: 'FINANCEUR N1 public',
      financeurPublic: true,
      disable: false

    }
  }

  ]

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        RouterTestingModule,
        TranslateModule.forRoot()

      ],
      declarations: [
        RecapCoFinancementComponent
      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: TranslateService },
        FormatMonetairePipe
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(RecapCoFinancementComponent);
    component = fixture.componentInstance;
    //  component.coFinanceur.push(cofinanceur) ;
    //  component.data = data;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should control aide public and privee are valid', () => {
    const montantAideControl = component.montantAideControl;
    const aidePubliqueControl = component.aidePubliqueControl;
    const aidePriveeControl = component.aidePriveeControl;
    const autoFinancementControl = component.autoFinancementControl;
    expect(montantAideControl.errors).toBeNull();
    expect(aidePubliqueControl.errors).toBeNull();
    expect(aidePriveeControl.errors).toBeNull();
    expect(autoFinancementControl.errors).toBeNull();
    component.calculMontantExterne(cofinaceur);
    component.updateForm();
    expect(NumberUtils.toNumber(aidePriveeControl.value)).toBe(NumberUtils.toNumber("5 000"));
    expect(NumberUtils.toNumber(aidePubliqueControl.value)).toBe(NumberUtils.toNumber("2 500"));
  });


  it('should controlaide taux are  valid', () => {
    // component.ngOnInit();
    const montantAideControl = component.montantAideControl;
    const tauxAutoFinancementControl = component.tauxAutoFinancementControl;
    const tauxAidePriveeControl = component.tauxAidePriveeControl;
    const tauxAidePubliqueControl = component.tauxAidePubliqueControl;
    const tauxMontantAideControl = component.tauxMontantAideControl;
    expect(montantAideControl.errors).toBeNull();
    component.data.montantOperation = data.montantOperation;
    component.data.montantAideAgence = data.montantAideAgence;
    component.calculMontantExterne(cofinaceur);
    component.updateForm();
    expect(tauxAutoFinancementControl.value).toBe('-700.00');
    expect(tauxAidePriveeControl.value).toBe('500.00');
    expect(tauxAidePubliqueControl.value).toBe('250.00');
    expect(tauxMontantAideControl.value).toBe('50.00');
  });

  it('should change montant autoFinancement when totalOperation chnage', () => {
    component.ngOnInit();
    const autoFinancementControl = component.autoFinancementControl;

    expect(autoFinancementControl.errors).toBeNull();
    component.data = {
      montantOperation: 1000,
      montantAideAgence: 500,
      montantAidePrivee: 5000,
      montantAidePublique: 2500
    };
    component.getTotalOperation(dossierFinancier.totalMontantOperation);
    component.updateForm();
    expect(NumberUtils.toNumber(autoFinancementControl.value)).toBe(NumberUtils.toNumber('-7 000'));
    expect(data.montantOperation).toBe(1000);
  });

  it('should change montant montantAideAgence when subvention chnage', () => {
    const montantAideControl = component.montantAideControl;
    component.data.montantAideAgence = data.montantAideAgence;
    expect(montantAideControl.errors).toBeNull();
    component.getTotalEquivalentSubventionAgenceDeletOp(data.montantAideAgence);
    component.updateForm();
    expect(montantAideControl.value).toBe('500');

  });


  it('should emit montantAutoFinace', () => {

    const spyAutoFinaceChange = spyOn(component.onRecapCofinancementFormChange, 'emit').and.callThrough();
    const autoFinancementControl = component.autoFinancementControl;
    autoFinancementControl.setValue(1254)
    component.onRecapCofinancementFormChange.emit(autoFinancementControl.value)

    expect(spyAutoFinaceChange.calls.any()).toBe(true);
    expect(spyAutoFinaceChange.calls.count()).toBe(1);

  });
});
