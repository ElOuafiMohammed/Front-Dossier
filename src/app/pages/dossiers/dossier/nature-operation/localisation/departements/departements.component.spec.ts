import { DepartementsComponent } from './departements.component';

import { Dossier, Departements } from '../../../../dossiers.interface';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from 'app/theme/material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DossierService } from '../../../../dossiers.service';
import { TranslateService, TranslatePipe, TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import MethodeGenerique from 'app/shared/methodes-generiques';


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

  getDepartements() {
    return Observable.of(dummyDepartements)
  }

}

describe('DepartementsComponent', () => {
  let component: DepartementsComponent
  let fixture: ComponentFixture<DepartementsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: DossierService, useClass: UpdateDossierServiceStub },
        { provide: TranslateService, useValue: TranslatePipe },
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      declarations: [
        DepartementsComponent
      ],

    });
    fixture = TestBed.createComponent(DepartementsComponent);
    component = fixture.componentInstance;
    component.currentOperation = dummyDossier.operationDossier.operations[0];
    component.dossierService.dossier = dummyDossier;
    component.currentOperation.departements = [{
      id: 1,
      nomDept: 'Ain',
      numero: '01',
    },
    {
      id: 2,
      nomDept: 'Aisne',
      numero: '02',
    }];
    component.listDepartementsReduce = [{
      id: 3,
      nomDept: 'Allier',
      numero: '03',
    },
    {
      id: 4,
      nomDept: 'Alpes-de-Haute-Provence',
      numero: '04',
    }];
    component.currentOperation.lignesMasseEau = [{
      code: 'FRFR209',
      nom: 'Le Tescou',
      categorieCode: 'R',
      categorieLibelle: 'Rivière',
      commissionTerritorialeCode: 'FRF_TARN',
      commissionTerritorialeLibelle: 'Tarn - Aveyron'
    }];
    component.currentOperation.communes = [{
      id: 1,
      nomCommune: 'Achery',
      numInsee: '02002'
    }];
    component.currentOperation.bvGestionNatureOperations = [{
      id: 1,
      numero: 'bvg110',
      nom: 'bvgNom'
    }];
    component.currentOperation.regions = [{
      id: 1,
      nomRegion: 'Region1',
      numero: '001'
    }]
  });

  it('#onDepartementSelect should add a departement in selectedDepartements list and delete it in listDepartementsReduce', () => {
    const departementToAdd: Departements = component.listDepartementsReduce[0]

    const oldLengthSelected = component.currentOperation.departements.length;
    const oldLengthReduce = component.listDepartementsReduce.length;
    component.onDepartementSelect(departementToAdd);

    expect(component.currentOperation.departements.length).toBe(oldLengthSelected + 1);
    expect(component.currentOperation.departements).toContain(departementToAdd)
    expect(component.listDepartementsReduce.length).toBe(oldLengthReduce - 1);
    expect(component.listDepartementsReduce).not.toContain(departementToAdd)

  });

  it('#onDeleteDepartement should delete a departement in selectedDepartements list and delete it in listDepartementsReduce', () => {
    const departementToDelete: Departements = component.currentOperation.departements[0]

    const oldLengthSelected = component.currentOperation.departements.length;
    const oldLengthReduce = component.listDepartementsReduce.length;
    component.onDeleteDepartement(departementToDelete);

    expect(component.currentOperation.departements.length).toBe(oldLengthSelected - 1);
    expect(component.currentOperation.departements).not.toContain(departementToDelete);
    expect(component.listDepartementsReduce.length).toBe(oldLengthReduce + 1);
    expect(component.listDepartementsReduce).toContain(departementToDelete);
  });

  it('#sortingDepartement should return -1 if departement.numero inferior to the ther departement.numero, else return 1 and return 0 if equals', () => {
    const departement1: Departements = {
      id: 1,
      nomDept: 'Ain',
      numero: '01',
    };
    const departement2: Departements = {
      id: 2,
      nomDept: 'Aisne',
      numero: '02',
    };

    let sort: number
    sort = MethodeGenerique.sortingDepartement(departement1, departement2);
    expect(sort).toEqual(-1)

    sort = MethodeGenerique.sortingDepartement(departement2, departement1);
    expect(sort).toEqual(1)

    sort = MethodeGenerique.sortingDepartement(departement1, departement1);
    expect(sort).toEqual(0)
  });

  it('#filterDepartements shoud return a list of departements containing the value of the user input', () => {
    let userInput = 'Allier';
    let result: Departements[] = component.filterDepartements(userInput, component.listDepartementsReduce, 3);
    expect(result[0]).toBe(component.listDepartementsReduce[0]);

    userInput = '04';
    result = component.filterDepartements(userInput, component.listDepartementsReduce, 3);
    expect(result[0]).toBe(component.listDepartementsReduce[1]);

    userInput = 'xyz';
    result = component.filterDepartements(userInput, component.listDepartementsReduce, 3);
    expect(result.length).toBe(0);
  });
});


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
      departements: [{
        id: 1,
        nomDept: 'Ain',
        numero: '01',
      },
      {
        id: 2,
        nomDept: 'Aisne',
        numero: '02',
      }
      ],
      communes: [{
        id: 1,
        nomCommune: 'Achery',
        numInsee: '02002'
      },
      {
        id: 2,
        nomCommune: 'Abergement de Varey',
        numInsee: '01002'
      }
      ],
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
      ouvrageNatureOperation: [{
        id: null,
        typeOuvrage: {
          id: null,
          code: '',
          codeParam: '',
          libelleParam: '',
          libelle: '',
          texte: ''
        },
        codeAgence: '',
        libelle: '',
        disable: false
      }],
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
    }]
  },
  noOrdreFormate: '00001',
  numeroDossier: 'AEEP-09-00001',
  numero_aid: null,
}

const dummyDepartements: Departements[] = [
  {
    id: 1,
    nomDept: 'Ain',
    numero: '01',
  },
  {
    id: 2,
    nomDept: 'Aisne',
    numero: '02',
  },
  {
    id: 3,
    nomDept: 'Allier',
    numero: '03',
  },
  {
    id: 4,
    nomDept: 'Alpes-de-Haute-Provence',
    numero: '02',
  }];
