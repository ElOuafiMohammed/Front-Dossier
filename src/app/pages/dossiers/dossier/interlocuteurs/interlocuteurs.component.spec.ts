import {
  async,
  ComponentFixture,
  TestBed,
  getTestBed,
  fakeAsync
} from "@angular/core/testing";
import { InterlocuteursComponent } from "./interlocuteurs.component";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClient } from "@angular/common/http";
import {
  HttpClientTestingModule,
  HttpTestingController
} from "@angular/common/http/testing";
import { ResponsableTechnique } from "../../create-dossier/create-dossier.interface";

import {
  MatAutocompleteModule,
  MatIconModule,
  MatInputModule
} from "@angular/material";
import { MaterialModule } from "../../../../theme/material/material.module";
import { FlexLayoutModule } from "@angular/flex-layout";
import { TranslateModule } from "@ngx-translate/core";
import { DossierService } from "../../dossiers.service";
import { DossierServiceStub } from "../../dossiers.service.spec";
import { Observable, BehaviorSubject } from "rxjs";
import { Interlocuteur, Dossier } from "../../dossiers.interface";

describe("SIGA 3068 - Interlocuters with Responsables Administratifs", () => {
  let component: InterlocuteursComponent;
  let fixture: ComponentFixture<InterlocuteursComponent>;
  let injector: TestBed;
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
    beneficiaire: null,
    referenceBenef: "",
    preDossier: null,
    responsableTechnique: null,
    responsableAdministratif: null,
    donneeSpecifiqueThema: null,
    loginRespAdm: null,
    noOrdre: 4,
    phase: null,
    refusDossier: null,
    dateDemande: null,
    origineDemande: null,
    noOrdreFormate: "00004",
    numeroDossier: "AGRI-31-00004",
    numeroAid: null,
    dossierCorrespondance: null,
    correspondants: [],
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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        CommonModule,
        MatAutocompleteModule,
        MatIconModule,
        MaterialModule,
        FlexLayoutModule,
        MatInputModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      declarations: [InterlocuteursComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: HttpClient, HttpTestingController }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterlocuteursComponent);
    component = fixture.componentInstance;
    injector = getTestBed();
    fixture.detectChanges();
  });

  it("SIGA-3068 - Should create the component", async(() => {
    expect(component).toBeTruthy();
  }));

  it("SIGA-3068 - Should have a valid form by default", () => {
    expect(component.formCorrespondant.valid).toBeTruthy();
  });

  it("SIGA-3068 - Should be able to create a valid Responsable Administratif field", () => {
    const form = component.formCorrespondant;
    const responsableAdministratifControl = component.respAdministratifControl;
    const responsableAdministratifValidatorKey =
      component.respAdministratifValidatorKey;

    const responsableAdministratifValue: ResponsableTechnique = {
      login: "Test",
      prenom: "Test",
      nom: "TESTY",
      email: "TESTY TESTY",
      organisation: "TESTY TESTY TESTY",
      telephone: "TESTY TESTY TESTYy"
    };
    responsableAdministratifControl.setValue(responsableAdministratifValue);

    expect(
      responsableAdministratifControl.hasError(
        responsableAdministratifValidatorKey
      )
    ).toBeFalsy();
    expect(form.valid).toBeTruthy();
  });

  it('#onAddInterLocteur should add an empty "Interlocuteur" in th data array of the component', () => {
    component.currentDossier = dummyDossier;
    component.ngOnInit();

    const isRespAdmEvent = spyOn(
      component.isRespAdmEvent,
      "emit"
    ).and.callThrough();
    const isCorrespondantValidParent = spyOn(
      component.isCorrespondantValidParent,
      "emit"
    ).and.callThrough();
    let n = component.currentDossier.correspondants.length;
    component.onAddInterLocteur();
    expect(component.currentDossier.correspondants.length).toEqual(n + 1);
    expect(component.canAdd).toBeFalsy();
    expect(isRespAdmEvent.calls.any()).toBe(true);
    expect(isCorrespondantValidParent.calls.any()).toBe(true);
  });
});
