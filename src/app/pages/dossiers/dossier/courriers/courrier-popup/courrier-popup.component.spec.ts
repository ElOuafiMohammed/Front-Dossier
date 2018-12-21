import {
  TestBed,
  ComponentFixture,
  fakeAsync,
  tick
} from "@angular/core/testing";
import { CommonModule, DatePipe } from "@angular/common";
import { ReactiveFormsModule, FormBuilder } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MaterialModule } from "app/theme/material/material.module";
import { TranslateService, TranslateModule } from "@ngx-translate/core";
import {
  MatDialogRef,
  DateAdapter,
  MAT_DATE_LOCALE,
  MatDialogModule
} from "@angular/material";
import {
  MatMomentDateModule,
  MomentDateAdapter
} from "@angular/material-moment-adapter";

import { CourrierPopupComponent } from "./courrier-popup.component";
import { DossierService } from "../../../dossiers.service";
import { DossierServiceStub } from "../../../dossiers.service.spec";
import { ModeleGCD, MOCKModele } from "../courrier.interface";
import { Dossier } from "../../../dossiers.interface";
import {
  Beneficiaire,
  ResponsableTechnique
} from "../../../create-dossier/create-dossier.interface";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import GeneriqueListValeur from "app/shared/generic-listValeur";
import { SpinnerLuncher } from "../../../../../shared/methodes-generiques";
import {
  SpinnerLuncherStub,
  dummyResponsableAdministratif
} from "../../../../../shared/test.helper";

const myDate: Date = new Date();

const myBeneficiaire: Beneficiaire = {
  actif: true,
  reference: "01234567M",
  raisonSociale: "raison sociale de ",
  actifLibelle: "",
  status: "test",
  address: {
    adresse: "30 rue de jedetestelestestunitaire",
    adresse1: null,
    adresse2: null,
    adresse3: null,
    adresse4: null,
    adresse5: null,
    codePostal: "31000",
    acheminement: "TOULOUSE",
    titreCivilite: "Monsieur",
    formulesPolitesse: null
  },
  commune: {
    nomCommune: "string",
    numInsee: "string"
  }
};

const dummyDossier: Dossier = {
  id: 4,
  departement: "31",
  courriers: [],
  thematique: {
    id: 1,
    codeParam: "THEMA",
    libelleParam: null,
    code: "AGRI",
    libelle: "Agriculture"
  },
  intitule: "test update dossier",
  beneficiaire: myBeneficiaire,
  referenceBenef: "",
  preDossier: null,
  responsableTechnique: null,
  responsableAdministratif: null,
  donneeSpecifiqueThema: null,
  loginRespAdm: null,
  noOrdre: 4,
  phase: null,
  refusDossier: null,
  dateDemande: myDate,
  origineDemande: null,
  noOrdreFormate: "00004",
  numeroDossier: "AGRI-31-00004",
  numeroAid: null,
  dossierCorrespondance: null,
  operationDossier: {
    operations: [
      {
        id: 1,
        natureOperation: {
          id: 30649,
          ligne: "110",
          numero: "01",
          libelle: "Création station d épuration",
          codeThematique: "AEEP"
        },
        totalMontantOperation: 1190900,
        totalMontantEligible: 1190900,
        totalMontantRetenu: 1190900,
        coutsTravaux: [
          {
            id: 2,
            libelleCout: "dssffsf",
            montantOperation: 545450,
            montantEligible: 545450,
            montantRetenu: 545450,
            hasError: false,
            idFront: 0
          },
          {
            id: 1,
            libelleCout: "sdfsfsfs",
            montantOperation: 645450,
            montantEligible: 645450,
            montantRetenu: 645450,
            hasError: false,
            idFront: 0
          }
        ],
        communes: [],
        departements: [],
        regions: [],
        themes: [],
        ouvrageNatureOperation: [],
        specificiteCalcul: "",
        montantAvance: 0,
        lignesMasseEau: [],
        tauxAvance: null,
        montantAvanceEqSubvention: null,
        montantSubvention: 0,
        tauxSubvention: null,
        dispositifPartenariatOperation: [],
        noOrdre: 1,
        localisationPertinente: true,
        bvGestionNatureOperations: []
      }
    ]
  },
  dossierFinancier: null,
  texteRecapDtp: null,
  domaine: null,
  derogationJustif: null,
  derogatoire: null,
  margeAvenir: null,
  margeAvenirJustif: null,
  procedureDecision: null,
  descriptionOperation: null,
  resultatsAttendus: null,
  planFinancementDossier: {
    coFinanceurs: [
      {
        id: 4,
        financeur: {
          id: 1,
          code: "F1",
          libelle: "FINANCEUR N1 prive",
          financeurPublic: false,
          disable: false
        },
        montantAide: 0,
        tauxAide: null
      },
      {
        id: 2,
        financeur: {
          id: 2,
          code: "F2",
          libelle: "FINANCEUR N1 public",
          financeurPublic: true,
          disable: true
        },
        montantAide: 0,
        tauxAide: null
      }
    ]
  },
  sessionDecision: null,
  totalPrixEauTtc: 0,
  totalPrixHtva: 0,
  valideRl: true,
  totalMontantAide: 1000000,
  valideSga: true,
  documentsDossier: null,
  descriptifTechnique: null,
  avis: null,
  motifAvis: "motif"
};

describe("Unit Test of SearchPopupOuvrageComponent", () => {
  let component: CourrierPopupComponent;
  let fixture: ComponentFixture<CourrierPopupComponent>;
  let dossierService: DossierService;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MaterialModule,
        BrowserAnimationsModule,
        CommonModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        MatMomentDateModule,
        TranslateModule.forRoot()
      ],
      declarations: [CourrierPopupComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: TranslateService },
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: MAT_DATE_LOCALE, useValue: "fr" },
        {
          provide: DateAdapter,
          useClass: MomentDateAdapter,
          deps: [MAT_DATE_LOCALE]
        },
        { provide: SpinnerLuncher, useClass: SpinnerLuncherStub },
        DatePipe,
        FormBuilder
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourrierPopupComponent);
    component = fixture.componentInstance;
    dossierService = fixture.debugElement.injector.get(DossierService);
    dossierService.dossier = dummyDossier;

    // fixture.detectChanges();
  });

  it("should create", fakeAsync(() => {
    tick(500);
    fixture.whenStable().then(() => {
      expect(component).toBeTruthy();
    });
  }));

  // -------------------------- MODELE --------------------------

  it("should add to courier a selected modele", fakeAsync(() => {
    const myModele: ModeleGCD = MOCKModele[0];
    component.onModeleSelect(myModele);

    tick(500);
    fixture.whenStable().then(() => {
      expect(component.courrier.modele).toBe(myModele);
    });
  }));

  it("should return type of modele", fakeAsync(() => {
    const myModele: ModeleGCD = MOCKModele[0];

    tick(500);
    fixture.whenStable().then(() => {
      expect(component.displayModele(myModele)).toBe("Autre");
    });
  }));

  it("should return a list of modele when writting", fakeAsync(() => {
    const modeles: ModeleGCD[] = [
      {
        type: "Autre",
        code: "66309a2-5f7a-4e2c-bc3b-e521cb2Beead"
      },
      {
        type: "Zotr",
        code: "6495df-5ds1-52zd-dc5e-zd1z5eeef15V"
      },
      {
        type: "Zaddtr",
        code: "6495df-5ds1-52zd-dc5e-zd1z5eeef15V"
      }
    ];
    component.modeles = modeles;
    tick(500);
    fixture.whenStable().then(() => {
      expect(
        GeneriqueListValeur.filterListValeurModele("A", modeles, 1)[0]
      ).toBe(modeles[0]);
      expect(
        GeneriqueListValeur.filterListValeurModele("Z", modeles, 1).length
      ).toBe(2);
    });
  }));

  // it('should manage an invalid Modele field value', () => {
  // fixture.detectChanges();
  // component.ngOnInit();
  // const modeleInvalidValue: ModeleGCD = {
  //   type: 'ff',
  //   code: 'ffff',
  // };
  // const modeleControl = component.modeleControl;
  // const modeleValidatorKey = component.modeleValidatorKey;
  // modeleControl.setValue(modeleInvalidValue);

  // expect(modeleControl.errors[modeleValidatorKey]).toBeTruthy();
  // expect(component.formCourrier.valid).toBeFalsy();
  // });

  // -------------------------- AVIS DE RECEPTION --------------------------

  it("should add to courrier the value of toggle button", fakeAsync(() => {
    component.onChangeToggle(true);

    tick(500);
    fixture.whenStable().then(() => {
      expect(component.courrier.avisDeReception).toBe(true);
    });
  }));

  // -------------------------- RESPONSABLE TECHNIQUE --------------------------

  it("should add to courrier a selected responsable technique", fakeAsync(() => {
    const myContact: ResponsableTechnique = {
      login: "MURIEL",
      prenom: "MURIEL",
      nom: "ACHACHE",
      email: null,
      organisation: null,
      telephone: null
    };
    component.onContactSelect(myContact);
    tick(500);
    fixture.whenStable().then(() => {
      expect(component.courrier.contact).toBe(myContact);
    });
  }));

  it("should return prenom and nom of responsable technique", fakeAsync(() => {
    const myContact: ResponsableTechnique = {
      login: "MURIEL",
      prenom: "MURIEL",
      nom: "ACHACHE",
      email: null,
      organisation: null,
      telephone: null
    };
    tick(500);
    fixture.whenStable().then(() => {
      expect(component.displayContact(myContact)).toBe("MURIEL  ACHACHE");
    });
  }));

  it("should return a list of responsable technique when writting", fakeAsync(() => {
    const contacts: ResponsableTechnique[] = [
      {
        login: "MURIEL",
        prenom: "MURIEL",
        nom: "ACHACHE",
        email: null,
        organisation: null,
        telephone: null
      },
      {
        login: "SADRIEN",
        prenom: "SADRIEN",
        nom: "AUTRE",
        email: null,
        organisation: null,
        telephone: null
      },
      {
        login: "SAINDY",
        prenom: "SAINDY",
        nom: "ENCORE AUTRE",
        email: null,
        organisation: null,
        telephone: null
      }
    ];
    component.contacts = contacts;
    tick(500);
    fixture.whenStable().then(() => {
      expect(GeneriqueListValeur.filterContacts("m", contacts)[0]).toBe(
        contacts[0]
      );
      expect(GeneriqueListValeur.filterContacts("s", contacts).length).toBe(2);
    });
  }));

  // -------------------------- SIGNATAIRE --------------------------

  it("should add to courrier a selected signataire", fakeAsync(() => {
    const myRespTech: ResponsableTechnique = {
      login: "MURIEL",
      prenom: "MURIEL",
      nom: "ACHACHE",
      email: null,
      organisation: null,
      telephone: null
    };
    component.onSignataireSelect(myRespTech);
    tick(500);
    fixture.whenStable().then(() => {
      expect(component.courrier.signataire).toBe(myRespTech);
    });
  }));

  it("should return prenom and nom of signataire", fakeAsync(() => {
    const myRespTech: ResponsableTechnique = {
      login: "MURIEL",
      prenom: "MURIEL",
      nom: "ACHACHE",
      email: null,
      organisation: null,
      telephone: null
    };
    tick(500);
    fixture.whenStable().then(() => {
      expect(component.displaySignataire(myRespTech)).toBe("MURIEL  ACHACHE");
    });
  }));

  it("should return a list of signataires when writting", fakeAsync(() => {
    const signataires: ResponsableTechnique[] = [
      {
        login: "MURIEL",
        prenom: "MURIEL",
        nom: "ACHACHE",
        email: null,
        organisation: null,
        telephone: null
      },
      {
        login: "SADRIEN",
        prenom: "SADRIEN",
        nom: "AUTRE",
        email: null,
        organisation: null,
        telephone: null
      },
      {
        login: "SAINDY",
        prenom: "SAINDY",
        nom: "ENCORE AUTRE",
        email: null,
        organisation: null,
        telephone: null
      }
    ];
    component.signataires = signataires;
    tick(500);
    fixture.whenStable().then(() => {
      expect(component.filterSignataires("m")[0]).toBe(signataires[0]);
      expect(component.filterSignataires("s").length).toBe(2);
    });
  }));
});
