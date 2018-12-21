import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BvGestionComponent } from './bv-gestion.component';
import { MaterialModule } from '../../../../../../theme/material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DossierService } from '../../../../dossiers.service';
import { DossierServiceStub } from '../../../../dossiers.service.spec';
import { TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';

describe('BvGestionComponent', () => {

  let component: BvGestionComponent;
  let fixture: ComponentFixture<BvGestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: TranslateService, useValue: TranslatePipe },
        { provide: DossierService, useClass: DossierServiceStub }
      ],
      declarations: [BvGestionComponent],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BvGestionComponent);
    component = fixture.componentInstance;
    component.currentOperation = {
      id: 4,
      natureOperation: {
        id: 1,
        ligne: '110',
        numero: '01',
        libelle: 'Création de station d’épuration',
        codeThematique: 'AEEP'
      },
      communes: [{
        id: 1,
        nomCommune: 'Achery',
        numInsee: '02002'
      }],
      departements: [{
        id: 1,
        nomDept: 'Ain',
        numero: '01',
      }],
      totalMontantOperation: 0,
      totalMontantEligible: 0,
      totalMontantRetenu: 0,
      coutsTravaux: [],
      themes: [],
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
          libelleEtat: 'libelle',
          libelle: 'S.C.I. CLINIQUE DE BEAUPUY',
          disable: false,

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
          libelleEtat: 'libelle',
          libelle: 'S.C.I. CLINIQUE DE BEAUPUY',
          disable: false,

        }
      ],
      noOrdre: 1,
      localisationPertinente: true,
      bvGestionNatureOperations: [

        {
          id: 1,
          numero: '5',
          nom: 'test1'
        },
        {
          id: 2,
          numero: '00000000B',
          nom: 'test2'
        },
        {
          id: 3,
          numero: '00000000C',
          nom: 'test3'
        }
      ]
    };

    component.dataBvGestions = [
      { id: 1, numero: '5', nom: 'test1' },
      { id: 2, numero: '00000000B', nom: 'test2' },
      { id: 3, numero: '00000000C', nom: 'test3' },
      { id: 4, numero: '00000000D', nom: 'test4' },
      { id: 5, numero: '00000000E', nom: 'test5' },
      { id: 6, numero: '00000000F', nom: 'test6' }
    ];

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#getIndexElement should get index element ', () => {
    component.getIndexElement({ id: 2, numero: '00000000B', nom: 'test2' });
    expect(component.getIndexElement('test2')).toBe(1);
  });

  it('#onFocus should affects true to isHidden ', () => {
    component.onFocus();
    expect(component.isHidden).toBe(true);
  });
});
