import {
  async,
  ComponentFixture,
  TestBed,
  getTestBed
} from "@angular/core/testing";
import { CommonModule } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FlexLayoutModule } from "@angular/flex-layout";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { RouterTestingModule } from "@angular/router/testing";
import { AppService } from "app/app.service";
import { AppServiceStub } from "app/app.service.spec";

import {
  HttpClientTestingModule,
  HttpTestingController
} from "@angular/common/http/testing";
import { InfosSpecifiquesComponent } from "./infos-specifiques.component";
import { DossierService } from "../../dossiers.service";
import { NgaModule } from "../../../../theme/nga.module";

import { DossierServiceStub } from "../../dossiers.service.spec";
import { Dossier } from "../../dossiers.interface";

describe("InfosSpecifiquesComponent", () => {
  let component: InfosSpecifiquesComponent;
  let fixture: ComponentFixture<InfosSpecifiquesComponent>;
  let injector: TestBed;
  let dossierService: DossierService;
  let httpMock: HttpTestingController;
  let appService: AppService;
  const dummyDossier: Dossier = {
    id: 1,
    beneficiaire: null,
    departement: "31",
    noOrdre: null,
    noOrdreFormate: null,
    numeroAid: null,
    numeroDossier: null,
    referenceBenef: null,
    refusDossier: null,
    resultatsAttendus: null,
    totalMontantAide: null,
    courriers: null,
    phase: null,
    responsableAdministratif: null,
    loginRespAdm: null,
    intitule: "test création dossier",
    thematique: {
      id: 1,
      codeParam: "THEMA",
      libelleParam: null,
      code: "AGRI",
      libelle: "Agriculture"
    },
    donneeSpecifiqueThema: [
      {
        id: 182,
        parametreDonneeSpec: {
          id: 8,
          typeDiscriminant: "THEMA",
          codeDiscriminant: "AEEP",
          codeListe: null,
          label: "Auteur marché",
          noOrdre: 1,
          tailleDonnee: 100,
          typeDonnee: "S",
          codeParam: "AEEP01"
        },
        valeurDate: null,
        valeurDouble: null,
        valeurInteger: null,
        valeurListe: null,
        valeursListe: null,
        valeurString: "test"
      }
    ],
    responsableTechnique: {
      login: "test",
      prenom: "prenom dd",
      nom: "mon nom",
      email: "",
      telephone: "",
      organisation: ""
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterTestingModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        NgaModule.forRoot(),
        FlexLayoutModule
      ],
      declarations: [InfosSpecifiquesComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        {
          provide: AppService,
          useClass: AppServiceStub
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosSpecifiquesComponent);
    component = fixture.componentInstance;
    injector = getTestBed();
    fixture.detectChanges();
    dossierService = injector.get(DossierService);
    httpMock = injector.get(HttpTestingController);
    appService = injector.get(AppService);
  });
  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should init and create settings and source", () => {
    component.dossier = dummyDossier;
    expect(component.settings).toBeNull();
    component.ngOnChanges();
    expect(component.infoSpecAgri).toBeTruthy();
    expect(component.infoSpecAeep).toBeFalsy();
    expect(component.settings).toBeDefined();
    expect(component.source).toBeDefined();
  });

  it("should test price htva and htc", () => {
    component.dossier = dummyDossier;
    component.ngOnChanges();
    component.prixHtvControl.setValue("2.5");
    component.prixTotalControl.setValue("23.256");
    expect(component.prixHtvControl.errors).toBeNull();
    component.onlyDecimalMontant(
      component.prixTotalControl,
      component.prixTotalControl.value
    );
    expect(component.prixTotalControl.value).toBe("23.25");
  });
});
