import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { MaterialModule } from 'app/theme/material/material.module';

import { DossierService } from '../../../../dossiers.service';

import { Dossier } from '../../../../dossiers.interface';
import { MasseEau } from '../../../dossier.interface';

import { Subject } from 'rxjs/Subject';

import { TableauMasseEauComponent } from './masse-eau.component';

const dummyDossier: any = {
  id: 1,
  departement: '09',
  thematique: {
    id: 6,
    codeParam: 'THEMA',
    libelleParam: null,
    code: 'AEEP',
    libelle: 'Alimentation En Eau Potable',
    texte: null
  },
  intitule: 'test',
  referenceBenef: '00000000A',
  noOrdre: 1,
  phase: 'P00',
  refusDossier: null,
  dateDemande: null,
  origineDemande: null,
  domaine: null,
  beneficiaire: {
    reference: '00000000A',
    raisonSociale: 'CORRESPONDANT FICTIF POUR LIEN(S) TEMPORAIRE(S)',
    actif: true
  },
  responsableTechnique: {
    login: 'ACHACHE',
    nom: 'ACHACHE',
    prenom: 'MURIEL'
  },
  preDossier: {
    anneeEngagPrevi: null,
    sessionDecision: null,
    niveauPriorite: null,
    lignesPrevisionnel: [],
    totalMontantTravauxPrev: 0,
    totalMontantAidePrev: 0,
    typologie: null,
  },
  dossierFinancier: {
    engagementsParticuliers: [],
    dispositionsFinancieres: [],
  },
  texteRecapDtp: null,
  operationDossier: {
    operations: [{
      id: 1,
      natureOperation: {
        id: 1,
        ligne: '110',
        numero: '01',
        libelle: 'Création de station d’épuration'
      },
      totalMontantOperation: 0,
      totalMontantEligible: 0,
      totalMontantRetenu: 0,
      coutsTravaux: [],
      themes: [],
      ouvrageNatureOperation: [
        {
          id: 31,
          codeAgence: '31053100',
          typeOuvrage: {
            id: 56,
            codeParam: 'TYPE_OUV',
            libelleParam: 'Type d\'ouvrage',
            code: 'EIP',
            libelle: 'Etablissement industriel',
            texte: null
          },
          masseEaux: [],
          libelle: 'S.C.I. CLINIQUE DE BEAUPUY',
          libelleEtat: 'Exploitation',
          disable: false
        },
        {
          id: 32,
          codeAgence: '31053100',
          typeOuvrage: {
            id: 56,
            codeParam: 'TYPE_OUV',
            libelleParam: 'Type d\'ouvrage',
            code: 'EIP',
            libelle: 'Etablissement industriel',
            texte: null
          },
          masseEaux: [],
          libelle: 'S.C.I. CLINIQUE DE BEAUPUY',
          libelleEtat: 'Exploitation',
          disable: false
        }
      ],
      specificiteCalcul: '',
      montantAvance: 0,
      tauxAvance: 0,
      montantAvanceEqSubvention: 0,
      montantSubvention: 0,
      tauxSubvention: 0,
      lignesMasseEau: [{
        code: 'FRFR209',
        nom: 'Le Tescou',
        categorieCode: 'R',
        categorieLibelle: 'Rivière',
        commissionTerritorialeCode: 'FRF_TARN',
        commissionTerritorialeLibelle: 'Tarn - Aveyron'
      }],
      regions: [{
        id: 1,
        nomRegion: 'Region1',
        numero: '001'
      }],
      bvGestionNatureOperations: [{
        id: 1,
        numero: 'bvg110',
        nom: 'bvgNom'
      }],
      departements: [{
        id: 1,
        nomDept: 'Ain',
        numero: '01',
      }],
      communes: [{
        id: 1,
        nomCommune: 'Achery',
        numInsee: '02002'
      }]
    }]
  },
  noOrdreFormate: '00001',
  numeroDossier: 'AEEP-09-00001',
  numero_aid: null,
}

const dummyMasseEau: MasseEau = {
  categorieCode: 'AAAA',
  categorieLibelle: 'Test',
  code: 'FRFR209',
  commissionTerritorialeCode: 'BBBB',
  commissionTerritorialeLibelle: 'Tarn',
  nom: 'dummyMasseEau',
  hasError: false
}

class UpdateDossierServiceStub {

  private _dossier: Dossier = null;
  private _dossierSubject: Subject<boolean>;
  public dossier$: Observable<boolean>;

  private _dossierPhaseSubject: Subject<boolean>;
  public dossierPhase$: Observable<boolean>;

  constructor() {
    // Initialize dossier subject
    this._dossierSubject = new Subject<boolean>();
    this.dossier$ = this._dossierSubject.asObservable();

    this._dossierPhaseSubject = new Subject<boolean>();
    this.dossierPhase$ = this._dossierPhaseSubject.asObservable();
  }

  get dossier() {
    return this._dossier;
  }
  set dossier(value: Dossier) {
    this._dossier = value;
    this._dossierSubject.next(true);
  }

  getMasseEau() {
    return Observable.of(dummyMasseEau)
  }

}

describe('Test Component update dossier', () => {
  let componentInstance: TableauMasseEauComponent;
  let fixture: ComponentFixture<TableauMasseEauComponent>;

  // Initialisation
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: DossierService, useClass: UpdateDossierServiceStub },
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      declarations: [
        TableauMasseEauComponent
      ],

    }).compileComponents();
    fixture = TestBed.createComponent(TableauMasseEauComponent);
    componentInstance = fixture.componentInstance;
    componentInstance.currentOperation = dummyDossier.operationDossier.operations[0];

    componentInstance.dossierService.dossier = dummyDossier;
  });

  it('should create PartenairesDossierComponent', () => {
    // fixture.detectChanges();
    expect(componentInstance).toBeTruthy();
  });

  it('#checkUnsetMasseEaushould should return true if the last "masseEau" is already set in the list of "massesEeau" ie this.data in the component, else false', () => {
    // fixture.detectChanges();

    componentInstance.data.push(dummyMasseEau);
    expect(componentInstance.checkUnsetMasseEau()).toBeFalsy();

    componentInstance.data.push(dummyMasseEau);
    expect(componentInstance.checkUnsetMasseEau()).toBeTruthy();
  });

  it('#onAddLine should add an empty "masseEau" in th data array of the component', () => {
    // fixture.detectChanges();

    componentInstance.ngOnInit();
    const emptyMasseEau: MasseEau = {
      code: '',
      nom: '',
      categorieCode: '',
      categorieLibelle: '',
      commissionTerritorialeCode: '',
      commissionTerritorialeLibelle: ''
    };

    const spyMassesEauChangesEvent = spyOn(componentInstance.massesEauChangesEvent, 'emit').and.callThrough();
    const spyMassesEauHasErrorEvent = spyOn(componentInstance.masseEauHasErrorEvent, 'emit').and.callThrough();

    componentInstance.onAddLine();
    expect(componentInstance.data[componentInstance.data.length - 1]).toEqual(emptyMasseEau);
    expect(componentInstance.canAddNewMasseEau).toBeFalsy();
    expect(spyMassesEauChangesEvent.calls.any()).toBe(true);
    expect(spyMassesEauHasErrorEvent.calls.any()).toBe(true);
  });

  it('#onEditCodeMasseEauEvent should edit the last "masseEau" of the data', fakeAsync(() => {
    fixture.detectChanges();
    componentInstance.data = [...dummyDossier.operationDossier.operations[0].lignesMasseEau];

    const emptyMasseEau: MasseEau = {
      code: '',
      nom: '',
      categorieCode: '',
      categorieLibelle: '',
      commissionTerritorialeCode: '',
      commissionTerritorialeLibelle: ''
    };

    const addedMasseEau: MasseEau = {
      categorieCode: 'AAAA',
      categorieLibelle: 'Test',
      code: 'FRFR209',
      commissionTerritorialeCode: 'BBBB',
      commissionTerritorialeLibelle: 'Tarn',
      nom: 'dummyMasseEau',
      hasError: false
    }
    const spyMassesEauChangesEvent = spyOn(componentInstance.massesEauChangesEvent, 'emit').and.callThrough();
    const spyMassesEauHasErrorEvent = spyOn(componentInstance.masseEauHasErrorEvent, 'emit').and.callThrough();
    componentInstance.onAddLine();

    expect(componentInstance.data[componentInstance.data.length - 1]).toEqual(emptyMasseEau);
    expect(componentInstance.canAddNewMasseEau).toBeFalsy();
    expect(spyMassesEauChangesEvent.calls.any()).toBe(true);

    componentInstance.onEditCodeMasseEauEvent(dummyMasseEau);
    expect(componentInstance.data[componentInstance.data.length - 1]).toEqual(addedMasseEau);
    expect(componentInstance.canAddNewMasseEau).toBeTruthy();
    expect(spyMassesEauHasErrorEvent.calls.any()).toBe(true);
  }));

  it('#onDeleteMasseEauEvent should delete the "masseEau" from the data array of the component', () => {
    fixture.detectChanges();
    const masseEau1: MasseEau = {
      code: '1',
      nom: '1',
      categorieCode: '1',
      categorieLibelle: '1',
      commissionTerritorialeCode: '1',
      commissionTerritorialeLibelle: '1'
    };
    const masseEau2: MasseEau = {
      code: '2',
      nom: '2',
      categorieCode: '2',
      categorieLibelle: '2',
      commissionTerritorialeCode: '2',
      commissionTerritorialeLibelle: '2'
    };

    componentInstance.data = [masseEau1, masseEau2];
    componentInstance.data.push(dummyMasseEau);
    componentInstance.messageToDisplay = 'test';

    expect(componentInstance.data.length).toBe(3);

    componentInstance.onDeleteMasseEauEvent(masseEau1);
    expect(componentInstance.data.length).toBe(2);
    expect(componentInstance.data).toEqual([masseEau2, dummyMasseEau]);
    expect(componentInstance.messageToDisplay).toBe('test');

    componentInstance.onDeleteMasseEauEvent(dummyMasseEau);
    expect(componentInstance.data.length).toBe(1);
    expect(componentInstance.data).toEqual([masseEau2]);
    expect(componentInstance.messageToDisplay).toBe('');
  });

  it('#onChanges dataMasseDeauOuvrage, should not empty', () => {
    fixture.detectChanges();
    componentInstance.currentOperation.ouvrageNatureOperation[0].masseEaux = [
      {
        code: ' FRFG025',
        nom: ' Alluvions de l\' Isle et de la Dronne',
        categorieCode: ' G',
        categorieLibelle: ' Souterraine',
        commissionTerritorialeCode: null,
        commissionTerritorialeLibelle: null
      }
    ];
    componentInstance.ngOnChanges();
    expect(componentInstance.dataMasseDeauOuvrage.length).toBe(1);
  });
});
