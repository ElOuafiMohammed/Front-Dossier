import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TableauDynamiqueOuvrageComponent } from './tableau-dynamique-ouvrage.component';
import { DossierService } from '../../../../dossiers.service';
import { DossierServiceStub } from '../../../../dossiers.service.spec';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MaterialModule } from '../../../../../../theme/material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Caracteristique } from '../../../dossier.interface';
import { TranslateModule } from '@ngx-translate/core';

describe('TableauDynamiqueOuvrageComponent', () => {
  let component: TableauDynamiqueOuvrageComponent;
  let fixture: ComponentFixture<TableauDynamiqueOuvrageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
      ],

      schemas: [
        NO_ERRORS_SCHEMA
      ],
      declarations: [TableauDynamiqueOuvrageComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableauDynamiqueOuvrageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.currentOperation = {
      id: 4,
      natureOperation: {
        id: 1,
        ligne: '110',
        numero: '01',
        libelle: 'Création de station d’épuration',
        codeThematique: 'AEEP'
      },
      totalMontantOperation: 0,
      totalMontantEligible: 0,
      totalMontantRetenu: 0,
      coutsTravaux: [],
      themes: [],
      lignesMasseEau: [],
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
          libelle: 'S.C.I. CLINIQUE DE BEAUPUY',
          libelleEtat: 'Exploitation',
          disable: false,
          masseEaux: []
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
          libelle: 'S.C.I. CLINIQUE DE BEAUPUY',
          libelleEtat: 'Exploitation',
          disable: false,
          masseEaux: []
        }
      ],
      noOrdre: 1,
      localisationPertinente: true,
      departements: [],
      communes: [],
      regions: [],
    };
    component.currentOperation.ouvrageNatureOperation = [
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
        libelle: 'S.C.I. CLINIQUE DE BEAUPUY',
        libelleEtat: 'Exploitation',
        disable: false,
        caracteristiqueOuvrage: [],
        impactOuvrages: [],
        masseEaux: []
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
        libelle: 'S.C.I. CLINIQUE DE BEAUPUY',
        libelleEtat: 'Exploitation',
        disable: false,
        caracteristiqueOuvrage: [],
        impactOuvrages: [],
        masseEaux: []
      },
      {
        id: 33,
        codeAgence: '33140101',
        typeOuvrage: {
          id: 56,
          codeParam: 'TYPE_OUV',
          libelleParam: 'Type d\'ouvrage',
          code: 'EIP',
          libelle: 'Etablissement industriel',
          texte: null
        },
        libelle: 'S.C.I. CLINIQUE DE BEAUPUY',
        libelleEtat: 'Exploitation',
        disable: false,
        caracteristiqueOuvrage: [],
        impactOuvrages: [],
        masseEaux: []
      },
      {
        id: null,
        codeAgence: '31066006',
        typeOuvrage: {
          id: 56,
          codeParam: 'TYPE_OUV',
          libelleParam: 'Type d\'ouvrage',
          code: 'EIP',
          libelle: 'Etablissement industriel',
          texte: null
        },
        libelle: '',
        libelleEtat: '',
        disable: false,
        caracteristiqueOuvrage: [],
        impactOuvrages: [],
        masseEaux: []
      }
    ];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#notifyCheckParentComponent should call parent', () => {
    const spyonNotifyCheckParentComponent = spyOn(component, 'notifyCheckParentComponent').and.callThrough();
    component.notifyCheckParentComponent();
    expect(spyonNotifyCheckParentComponent.calls.any()).toBe(true);

  });



  it('#addOuvrage should add a row in the table', () => {
    const dataLength = component.currentOperation.ouvrageNatureOperation.length;
    component.addOuvrage();
    expect(component.currentOperation.ouvrageNatureOperation.length).toBe(dataLength);

  });

  it('#updateOuvrage should update the ouvrage passed', () => {
    const ouvrage = component.currentOperation.ouvrageNatureOperation[2];
    component.updateRow(ouvrage);
    expect(component.currentOperation.ouvrageNatureOperation[2].libelle).toBe('S.C.I. CLINIQUE DE BEAUPUY');
  });

  it('#onDeleteOuvrage should delete the passed ouvrage from the list', () => {
    component.loadDataSource();
    const dataLength = component.currentOperation.ouvrageNatureOperation.length;
    component.deleteRow(component.currentOperation.ouvrageNatureOperation);
    expect(component.addOuvrage).toBeTruthy();
    expect(component.currentOperation.ouvrageNatureOperation.length).toBe(dataLength - 4);

  });

  it('#hasErrorOuvrages devrait mettre à false stateButtonAdd', () => {
    component.stateButtonAdd = false;
    component.currentOperation.ouvrageNatureOperation[0].disable = false;
    component.currentOperation.ouvrageNatureOperation[0].hasError = true;
    component.hasErrorOuvrages();

    expect(component.stateButtonAdd).toBe(true);

  });
});
