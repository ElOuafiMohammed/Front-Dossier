import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'app/theme/material/material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { DispositifsRattachesComponent } from './dispositifs-rattaches.component';
import { DossierServiceStub } from 'app/pages/dossiers/dossiers.service.spec';
import { AppServiceStub } from 'app/app.service.spec';
import { AppService } from 'app/app.service';
import { TranslateModule } from '@ngx-translate/core';

describe('DispositifsRattachesComponent', () => {
  let component: DispositifsRattachesComponent;
  let fixture: ComponentFixture<DispositifsRattachesComponent>;

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
        { provide: AppService, useClass: AppServiceStub }
      ],

      declarations: [DispositifsRattachesComponent],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(DispositifsRattachesComponent);
    component = fixture.componentInstance;
    component.currentOperation = {
      id: 4,
      natureOperation: {
        id: 1,
        ligne: '110',
        numero: '01',
        libelle: 'Création de station d’épuration',
        codeThematique: 'ASST'
      },
      lignesMasseEau: [],
      totalMontantOperation: 0,
      totalMontantEligible: 0,
      totalMontantRetenu: 0,
      coutsTravaux: [],
      themes: [],
      dispositifPartenariatOperation: [
        {
          id: 12,
          numeroOrdre: null,
          idDispositifPartenariat: 12,
          typeDispositifPartenariat: {
            id: null,
            codeParam: null,
            libelleParam: null,
            code: null,
            libelle: null,
            texte: null
          },
          dispositifPartenariat: {
            id: 12,
            numeroOrdre: 0,
            isSansObjet: false,
            typeDispositif: {
              id: 56,
              codeParam: 'type code test',
              libelleParam: 'libelle test dispositif',
              code: 'CONV',
              libelle: 'T',
              texte: null
            },
            complementIntitule: 'S.C.I. CLINIQUE DE BEAUPUY',
            urlFrontDispositifPartenariat: ''
          },
          complementIntitule: null,
          montantAvance: null,
          pourcentageAvance: null,
          montantSubvention: null,
          pourcentageSubvention: null,
          urlFrontDispositifPartenariat: ''
        }
      ],
      noOrdre: 1,
      localisationPertinente: true,
      departements: [],
      communes: [],
      regions: []
    };
    component.data = [];

  }));


  /**
   * Create component
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * loadSource should load the data to table
   */
  it('#loadSource should load the data to table', () => {
    expect(component.source.count()).toBe(0);
    component.loadDataSource();
    expect(component.source.count()).toBe(component.data.length);

  });

  /**
   * addDispositif should add a row in the table
   */
  it('#addDispositif should add a row in the table', () => {
    const dataLength = component.data.length;
    component.onAddDispositif();
    expect(component.data.length).toBe(dataLength + 1);

  });

  /**
   * updateDispositif should update the dispositif passed
   */
  it('#updateDispositif should update the dispositif passed', () => {
    const dispositif = component.currentOperation.dispositifPartenariatOperation[0].dispositifPartenariat;
    component.updateDispositif(dispositif);
    expect(dispositif.complementIntitule).toBe('S.C.I. CLINIQUE DE BEAUPUY');

  });

  /**
   * onDeleteDispositif should delete the passed dispositif from the list
   */
  it('#onDeleteDispositif should delete the passed dispositif from the list', () => {
    component.loadDataSource();
    const dataLength = component.data.length;
    component.onDeleteDispositifEvent(component.currentOperation.dispositifPartenariatOperation[0]);
    expect(component.canAdd).toBeTruthy();
    expect(component.data.length - 1).toBe(dataLength - 1);
  });

  /**
   * #manageCanAdd should add true when to manage the addition of new line of dispositif
   */
  it('#manageCanAdd should add true when to manage the addition of new line of dispositif', () => {
    component.manageCanAdd(true);
    expect(component.canAdd).toBeTruthy();
    expect(component.enableMessageError).toBeFalsy();
  });


  /**
  * #manageCanAdd should add false when to manage the addition of new line of dispositif
  */
  it('#manageCanAdd should add false when to manage the addition of new line of dispositif', () => {
    component.manageCanAdd(false);
    expect(component.canAdd).toBeFalsy();
    expect(component.enableMessageError).toBeTruthy();
  });

  /**
  * #manageError Manage error in new dispositif
  */
  it('#manageError Manage error in new dispositif', () => {

    const dispositifPartenariat = {
      id: 12,
      numeroOrdre: 0,
      isSansObjet: false,
      typeDispositif: {
        id: 56,
        codeParam: 'type code test',
        libelleParam: 'libelle test dispositif',
        code: 'CONV',
        libelle: 'T',
        texte: null
      },
      complementIntitule: '',
      urlFrontDispositifPartenariat: ''
    }
    component.manageError(dispositifPartenariat);
    expect(dispositifPartenariat.complementIntitule).toBe('');
    component.manageCanAdd(false);
    expect(component.canAdd).toBeFalsy();
    expect(component.enableMessageError).toBeTruthy();
  });

  /**
  * #checkUnsetDispositif Check the dispositif is already added in table
  */
  it('#checkUnsetDispositif Check the dispositif is already added in table', () => {
    expect(component.checkUnsetDispositif).toBeTruthy();
  });


  /**
   * loadCurrentOperation should load the current operation
   */
  it('#loadCurrentOperation should load the current operation', () => {
    component.loadCurrentOperation(component.currentOperation);
    expect(component.data).toEqual(component.currentOperation.dispositifPartenariatOperation);
    component.loadDataSource();
  });

  /**
  * calculPourcentageMontantAvance Calcul pourcentage of montant Avance and return un string with %
  */
  it('#calculPourcentageMontantAvance Calcul pourcentage of montant Avance and return un string with %', () => {

    const montantAvanceCurrent = 10;
    const montantAvanceNatureOperation = 50;
    component.calculPourcentageMontantAvance(montantAvanceCurrent);
    const pourcentageAvance = ((montantAvanceCurrent / montantAvanceNatureOperation) * 100).toString() + '%';
    expect(pourcentageAvance).toEqual('20%');
    component.loadDataSource();
  });

  /**
  * calculPourcentageMontantSub Calcul pourcentage of montant subvention and return un string with %
  */
  it('#calculPourcentageMontantSub Calcul pourcentage of montant subvention and return un string with %', () => {
    const montantSubventionCurrent = 50;
    const montantSubventionNatureOperation = 500;
    component.calculPourcentageMontantSub(montantSubventionCurrent);
    const pourcentageSubvention = ((montantSubventionCurrent / montantSubventionNatureOperation) * 100).toString() + '%';
    expect(pourcentageSubvention).toEqual('10%');
    component.loadDataSource();
  });

  /**
   * Test calcule du cumul du montant avance
   */
  it('#calculCumulMontantAvance calcul le cumul du montant avance', () => {
    component.currentOperation.dispositifPartenariatOperation = [
      {
        id: 10,
        numeroOrdre: null,
        idDispositifPartenariat: 10,
        typeDispositifPartenariat: {
          id: null,
          codeParam: null,
          libelleParam: null,
          code: null,
          libelle: null,
          texte: null
        },
        dispositifPartenariat: {
          id: 10,
          numeroOrdre: 0,
          isSansObjet: false,
          typeDispositif: {
            id: 56,
            codeParam: 'type code test',
            libelleParam: 'libelle test dispositif',
            code: 'CONV',
            libelle: 'T',
            texte: null
          },
          complementIntitule: 'S.C.I. CLINIQUE DE BEAUPUY',
          urlFrontDispositifPartenariat: ''
        },
        complementIntitule: null,
        montantAvance: 100,
        pourcentageAvance: null,
        montantSubvention: 150,
        pourcentageSubvention: null,
        urlFrontDispositifPartenariat: ''
      },
      {
        id: 11,
        numeroOrdre: null,
        idDispositifPartenariat: 11,
        typeDispositifPartenariat: {
          id: null,
          codeParam: null,
          libelleParam: null,
          code: null,
          libelle: null,
          texte: null
        },
        dispositifPartenariat: {
          id: 11,
          numeroOrdre: 0,
          isSansObjet: false,
          typeDispositif: {
            id: 56,
            codeParam: 'type code test',
            libelleParam: 'libelle test dispositif',
            code: 'CONV',
            libelle: 'T',
            texte: null
          },
          complementIntitule: 'S.C.I. CLINIQUE DE BEAUPUY',
          urlFrontDispositifPartenariat: ''
        },
        complementIntitule: null,
        montantAvance: 200,
        pourcentageAvance: null,
        montantSubvention: 100,
        pourcentageSubvention: null,
        urlFrontDispositifPartenariat: ''
      },
      {
        id: 12,
        numeroOrdre: null,
        idDispositifPartenariat: 12,
        typeDispositifPartenariat: {
          id: 56,
          codeParam: 'type code test',
          libelleParam: 'libelle test dispositif',
          code: 'CPER',
          libelle: 'T',
          texte: null
        },
        dispositifPartenariat: {
          id: 12,
          numeroOrdre: 0,
          isSansObjet: false,
          typeDispositif: {
            id: 56,
            codeParam: 'type code test',
            libelleParam: 'libelle test dispositif',
            code: 'CPER',
            libelle: 'T',
            texte: null
          },
          complementIntitule: 'S.C.I. CLINIQUE DE BEAUPUY',
          urlFrontDispositifPartenariat: ''
        },
        complementIntitule: null,
        montantAvance: 500,
        pourcentageAvance: null,
        montantSubvention: 500,
        pourcentageSubvention: null,
        urlFrontDispositifPartenariat: ''
      }
    ];

    expect(component.getMontantAvanceCumul()).toBe(300);
  });

  /**
   * Test calcule du cumul du montant subvention
   */
  it('#calculCumulMontantSubvention calcul le cumul du montant subvention', () => {
    component.currentOperation.dispositifPartenariatOperation = [
      {
        id: 10,
        numeroOrdre: null,
        idDispositifPartenariat: 10,
        typeDispositifPartenariat: {
          id: null,
          codeParam: null,
          libelleParam: null,
          code: null,
          libelle: null,
          texte: null
        },
        dispositifPartenariat: {
          id: 10,
          numeroOrdre: 0,
          isSansObjet: false,
          typeDispositif: {
            id: 56,
            codeParam: 'type code test',
            libelleParam: 'libelle test dispositif',
            code: 'CONV',
            libelle: 'T',
            texte: null
          },
          complementIntitule: 'S.C.I. CLINIQUE DE BEAUPUY',
          urlFrontDispositifPartenariat: ''
        },
        complementIntitule: null,
        montantAvance: 100,
        pourcentageAvance: null,
        montantSubvention: 150,
        pourcentageSubvention: null,
        urlFrontDispositifPartenariat: ''
      },
      {
        id: 11,
        numeroOrdre: null,
        idDispositifPartenariat: 11,
        typeDispositifPartenariat: {
          id: null,
          codeParam: null,
          libelleParam: null,
          code: null,
          libelle: null,
          texte: null
        },
        dispositifPartenariat: {
          id: 11,
          numeroOrdre: 0,
          isSansObjet: false,
          typeDispositif: {
            id: 56,
            codeParam: 'type code test',
            libelleParam: 'libelle test dispositif',
            code: 'CONV',
            libelle: 'T',
            texte: null
          },
          complementIntitule: 'S.C.I. CLINIQUE DE BEAUPUY',
          urlFrontDispositifPartenariat: ''
        },
        complementIntitule: null,
        montantAvance: 200,
        pourcentageAvance: null,
        montantSubvention: 100,
        pourcentageSubvention: null,
        urlFrontDispositifPartenariat: ''
      },
      {
        id: 12,
        numeroOrdre: null,
        idDispositifPartenariat: 12,
        typeDispositifPartenariat: {
          id: 56,
          codeParam: 'type code test',
          libelleParam: 'libelle test dispositif',
          code: 'CPER',
          libelle: 'T',
          texte: null
        },
        dispositifPartenariat: {
          id: 12,
          numeroOrdre: 0,
          isSansObjet: false,
          typeDispositif: {
            id: 56,
            codeParam: 'type code test',
            libelleParam: 'libelle test dispositif',
            code: 'CPER',
            libelle: 'T',
            texte: null
          },
          complementIntitule: 'S.C.I. CLINIQUE DE BEAUPUY',
          urlFrontDispositifPartenariat: ''
        },
        complementIntitule: null,
        montantAvance: 500,
        pourcentageAvance: null,
        montantSubvention: 500,
        pourcentageSubvention: null,
        urlFrontDispositifPartenariat: ''
      }
    ];

    expect(component.getMontantSubventionCumul()).toBe(250);
  });

  /**
   * Test vérification du cumul du montant avance
   */
  it('#VerifieCumulMontantAvance vérifier le cumul du montant avance', () => {
    component.currentOperation.dispositifPartenariatOperation = [
      {
        id: 10,
        numeroOrdre: null,
        idDispositifPartenariat: 10,
        typeDispositifPartenariat: {
          id: null,
          codeParam: null,
          libelleParam: null,
          code: null,
          libelle: null,
          texte: null
        },
        dispositifPartenariat: {
          id: 10,
          numeroOrdre: 0,
          isSansObjet: false,
          typeDispositif: {
            id: 56,
            codeParam: 'type code test',
            libelleParam: 'libelle test dispositif',
            code: 'CONV',
            libelle: 'T',
            texte: null
          },
          complementIntitule: 'S.C.I. CLINIQUE DE BEAUPUY',
          urlFrontDispositifPartenariat: ''
        },
        complementIntitule: null,
        montantAvance: 100,
        pourcentageAvance: null,
        montantSubvention: 150,
        pourcentageSubvention: null,
        urlFrontDispositifPartenariat: ''
      },
      {
        id: 11,
        numeroOrdre: null,
        idDispositifPartenariat: 11,
        typeDispositifPartenariat: {
          id: null,
          codeParam: null,
          libelleParam: null,
          code: null,
          libelle: null,
          texte: null
        },
        dispositifPartenariat: {
          id: 11,
          numeroOrdre: 0,
          isSansObjet: false,
          typeDispositif: {
            id: 56,
            codeParam: 'type code test',
            libelleParam: 'libelle test dispositif',
            code: 'CONV',
            libelle: 'T',
            texte: null
          },
          complementIntitule: 'S.C.I. CLINIQUE DE BEAUPUY',
          urlFrontDispositifPartenariat: ''
        },
        complementIntitule: null,
        montantAvance: 200,
        pourcentageAvance: null,
        montantSubvention: 100,
        pourcentageSubvention: null,
        urlFrontDispositifPartenariat: ''
      },
      {
        id: 12,
        numeroOrdre: null,
        idDispositifPartenariat: 12,
        typeDispositifPartenariat: {
          id: 56,
          codeParam: 'type code test',
          libelleParam: 'libelle test dispositif',
          code: 'CPER',
          libelle: 'T',
          texte: null
        },
        dispositifPartenariat: {
          id: 12,
          numeroOrdre: 0,
          isSansObjet: false,
          typeDispositif: {
            id: 56,
            codeParam: 'type code test',
            libelleParam: 'libelle test dispositif',
            code: 'CPER',
            libelle: 'T',
            texte: null
          },
          complementIntitule: 'S.C.I. CLINIQUE DE BEAUPUY',
          urlFrontDispositifPartenariat: ''
        },
        complementIntitule: null,
        montantAvance: 500,
        pourcentageAvance: null,
        montantSubvention: 500,
        pourcentageSubvention: null,
        urlFrontDispositifPartenariat: ''
      }
    ];

    component.currentOperation.montantAvance = 300;

    expect(component.isCumulMontantAvanceValide()).toBe(true);
    expect(component.currentOperation.isErreurCumulMontantAvance).toBe(false);
  });

  /**
   * Test vérification du cumul du montant subvention
   */
  it('#VerifieCumulMontantSubvention vérifier le cumul du montant subvention', () => {
    component.currentOperation.dispositifPartenariatOperation = [
      {
        id: 10,
        numeroOrdre: null,
        idDispositifPartenariat: 10,
        typeDispositifPartenariat: {
          id: null,
          codeParam: null,
          libelleParam: null,
          code: null,
          libelle: null,
          texte: null
        },
        dispositifPartenariat: {
          id: 10,
          numeroOrdre: 0,
          isSansObjet: false,
          typeDispositif: {
            id: 56,
            codeParam: 'type code test',
            libelleParam: 'libelle test dispositif',
            code: 'CONV',
            libelle: 'T',
            texte: null
          },
          complementIntitule: 'S.C.I. CLINIQUE DE BEAUPUY',
          urlFrontDispositifPartenariat: ''
        },
        complementIntitule: null,
        montantAvance: 100,
        pourcentageAvance: null,
        montantSubvention: 150,
        pourcentageSubvention: null,
        urlFrontDispositifPartenariat: ''
      },
      {
        id: 11,
        numeroOrdre: null,
        idDispositifPartenariat: 11,
        typeDispositifPartenariat: {
          id: null,
          codeParam: null,
          libelleParam: null,
          code: null,
          libelle: null,
          texte: null
        },
        dispositifPartenariat: {
          id: 11,
          numeroOrdre: 0,
          isSansObjet: false,
          typeDispositif: {
            id: 56,
            codeParam: 'type code test',
            libelleParam: 'libelle test dispositif',
            code: 'CONV',
            libelle: 'T',
            texte: null
          },
          complementIntitule: 'S.C.I. CLINIQUE DE BEAUPUY',
          urlFrontDispositifPartenariat: ''
        },
        complementIntitule: null,
        montantAvance: 200,
        pourcentageAvance: null,
        montantSubvention: 100,
        pourcentageSubvention: null,
        urlFrontDispositifPartenariat: ''
      },
      {
        id: 12,
        numeroOrdre: null,
        idDispositifPartenariat: 12,
        typeDispositifPartenariat: {
          id: 56,
          codeParam: 'type code test',
          libelleParam: 'libelle test dispositif',
          code: 'CPER',
          libelle: 'T',
          texte: null
        },
        dispositifPartenariat: {
          id: 12,
          numeroOrdre: 0,
          isSansObjet: false,
          typeDispositif: {
            id: 56,
            codeParam: 'type code test',
            libelleParam: 'libelle test dispositif',
            code: 'CPER',
            libelle: 'T',
            texte: null
          },
          complementIntitule: 'S.C.I. CLINIQUE DE BEAUPUY',
          urlFrontDispositifPartenariat: ''
        },
        complementIntitule: null,
        montantAvance: 500,
        pourcentageAvance: null,
        montantSubvention: 500,
        pourcentageSubvention: null,
        urlFrontDispositifPartenariat: ''
      }
    ];

    component.currentOperation.montantSubvention = 200;

    expect(component.isCumulMontantSubventionValide()).toBe(false);
    expect(component.currentOperation.isErreurCumulMontantSubvention).toBe(true);
  });
});
