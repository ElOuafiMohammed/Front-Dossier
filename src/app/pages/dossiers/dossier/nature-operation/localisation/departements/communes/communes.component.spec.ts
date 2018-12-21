import { CommunesComponent } from './communes.component';

import { Dossier } from '../../../../../dossiers.interface';
import { Communes } from '../../../../dossier.interface';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from 'app/theme/material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DossierService } from '../../../../../dossiers.service';
import { TranslateService, TranslatePipe, TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';


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

  getCommunes() {
    return Observable.of(dummyCommunes)
  }

}

describe('DepartementsComponent', () => {
  let component: CommunesComponent
  let fixture: ComponentFixture<CommunesComponent>;

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
        CommunesComponent
      ],

    });
    fixture = TestBed.createComponent(CommunesComponent);
    component = fixture.componentInstance;
    component.currentOperation = dummyDossier.operationDossier.operations[0];

    component.dossierService.dossier = dummyDossier;
    component.currentOperation.communes = [{
      id: 1,
      nomCommune: 'Achery',
      numInsee: '02002'
    },
    {
      id: 2,
      nomCommune: 'Abergement de Varey',
      numInsee: '01002'
    }];
    component.listCommunesReduce = [{
      id: 3,
      nomCommune: 'EntrezNomDeVille',
      numInsee: '01003'
    },
    {
      id: 2,
      nomCommune: 'EntrezNomDeVillage',
      numInsee: '01004'
    }];
  });

  it('#onCommuneSelect should add a commune in currentOperation.communes list and delete it in listCommunesReduce', () => {
    const communeToAdd: Communes = component.listCommunesReduce[0]

    const oldLengthSelected = component.currentOperation.communes.length;
    const oldLengthReduce = component.listCommunesReduce.length;
    component.onCommuneSelect(communeToAdd);

    expect(component.currentOperation.communes.length).toBe(oldLengthSelected + 1);
    expect(component.currentOperation.communes).toContain(communeToAdd)
    expect(component.listCommunesReduce.length).toBe(oldLengthReduce - 1);
    expect(component.listCommunesReduce).not.toContain(communeToAdd)

  });

  it('#onDeleteCommune should delete a commune in currentOperation.communes list and delete it in listCommunesReduce', () => {
    const communeToDelete: Communes = component.currentOperation.communes[0]

    const oldLengthSelected = component.currentOperation.communes.length;
    const oldLengthReduce = component.listCommunesReduce.length;
    component.onDeleteCommune(communeToDelete);

    expect(component.currentOperation.communes.length).toBe(oldLengthSelected - 1);
    expect(component.currentOperation.communes).not.toContain(communeToDelete);
    expect(component.listCommunesReduce.length).toBe(oldLengthReduce + 1);
    expect(component.listCommunesReduce).toContain(communeToDelete);
  });

  it('#sortingCommune should return -1 if commune.numero is inferior to the commune.numero, else return 1 and return 0 if equals', () => {
    const commune1: Communes = {
      id: 1,
      nomCommune: 'Achery',
      numInsee: '02002'
    };
    const commune2: Communes = {
      id: 2,
      nomCommune: 'Abergement de Varey',
      numInsee: '01002'
    };

    let sort: number
    sort = component.sortingCommunes(commune1, commune2);
    expect(sort).toEqual(1)

    sort = component.sortingCommunes(commune2, commune1);
    expect(sort).toEqual(-1)

    sort = component.sortingCommunes(commune1, commune1);
    expect(sort).toEqual(0)
  });

  it('#filterCommunes shoud return a list of departements containing the value of the user input', () => {
    let userInput = 'Achery';
    let result: Communes[] = component.filterCommunes(userInput, component.currentOperation.communes, 3);
    expect(result[0]).toBe(component.currentOperation.communes[0]);

    userInput = '01';
    result = component.filterCommunes(userInput, component.currentOperation.communes, 3);
    expect(result[0]).toBe(component.currentOperation.communes[1]);

    userInput = 'xyz';
    result = component.filterCommunes(userInput, component.currentOperation.communes, 3);
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
    }]
  },
  noOrdreFormate: '00001',
  numeroDossier: 'AEEP-09-00001',
  numeroAid: null,
}

const dummyCommunes: Communes[] = [
  {
    id: 1,
    nomCommune: 'Achery',
    numInsee: '02002'
  },
  {
    id: 2,
    nomCommune: 'Abergement de Varey',
    numInsee: '01002'
  },
  {
    id: 3,
    nomCommune: 'EntrezNomDeVille',
    numInsee: '01003'
  },
  {
    id: 2,
    nomCommune: 'EntrezNomDeVillage',
    numInsee: '01004'
  }];
