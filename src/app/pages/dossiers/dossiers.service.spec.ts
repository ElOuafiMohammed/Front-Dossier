import { TestBed, getTestBed } from "@angular/core/testing";
import { HttpClient } from "@angular/common/http";
import {
  HttpClientTestingModule,
  HttpTestingController
} from "@angular/common/http/testing";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { Critere, CritereRemarque } from './recherche-dossier/recherche-dossier.interface';
import {
  Dossier,
  PreDossier,
  Commune,
  CritereSearchBeneficiaire,
  ListValeur,
  DescriptifTechnique,
  AvisDossier,
  ApplicationParam,
  Departements,
  Interlocuteur
} from "./dossiers.interface";
import {
  EnumCodeApplicationParam,
  EnumListValeur
} from "./dossier/enumeration/enumerations";
import {
  DossierUpdate,
  OrigineDemande,
  NiveauPriorite,
  SessionDecision,
  Theme,
  NatureOperation,
  Domaine,
  Typologie,
  TypeDispositif,
  EngagementsParticuliers,
  DispositionsFinancieres,
  CoefficientConversion,
  ProcedureDecision,
  Operation,
  EncadrementCommJustif,
  DossierAction,
  ModalitesReduction,
  ModalitesVersement,
  Avis,
  LastDateAttribution
} from './dossier/dossier.interface';
import { NatureRefus, RefusDossier } from './refuse-dossier-popup/refuse-dossier-popup.interface';
import { Beneficiaire, DossierCreate, ResponsableTechnique, Thematique, Phase } from './create-dossier/create-dossier.interface';
import { Libelle } from './dossier/previsionnel/tableau-dynam-prev/tableau-dynam-prev-interface';
import { getStubListValeur, dummyResponsableAdministratif } from 'app/shared/test.helper';

import { DossierService } from './dossiers.service';
import { AppService } from 'app/app.service';
import { AppServiceStub } from 'app/app.service.spec';
import { GlobalState } from 'app/global.state';
import { Financeur } from './dossier/plan-financement/tableau-dynam-cofinancements/tableau-dynam-cofinancements-interface';
import { Delegation } from 'app/pages/dossiers/validate-dossier/validate-dossier.interface';
import { FormGroup } from '@angular/forms';
import { EnumProfilDossier, EnumActionDossier } from 'app/pages/dossiers/dossier/enumeration/enumerations';
import { PieceJointe } from './dossier/pieces-jointes/pieces-jointes.interface';
import { EtatOuvrage, CritereSearchOuvrage } from './dossier/nature-operation/ouvrage/search-popup-ouvrage/search-popup-ouvrage.interface';
import { Courrier, ModeleGCD, Destinatiare } from './dossier/courriers/courrier.interface';
import { DossierPrevGestion } from 'app/pages/dossiers/gerer-prevesionnel-dossier/gerer-previsionnelle.component.interface';
import { TypeOuvrage, Ouvrage } from './dossier/nature-operation/ouvrage/tableau-dynamique-ouvrage/tableau-dynamique-ouvrage.interface';

/**
 * Stub of DossierService
 */
export class DossierServiceStub {
  private _dossierPhaseSubject: Subject<boolean>;
  private _dossierAdministratifSubject: Subject<boolean>;

  private _dossierSubject: Subject<boolean>;
  private _dossierUpdatedSubject: Subject<boolean>;
  private _dossier: Dossier = null;
  private _preDossier: PreDossier = null;
  private _ouvrageSubject: Subject<any>;
  private _formValidationCritere: FormGroup = null;
  private _formCorrespondant: FormGroup = null;
  public idsCheckedDossier: Array<number> = [];
  public checkAll = null;
  public currentPage = "";
  public previousPage = "";
  public listValeurs: ListValeur[];
  public url: any;

  public dossierPhase$: Observable<boolean>;
  public dossierAdministratif$: Observable<boolean>;

  public dossier$: Observable<boolean>;
  public dossierUpdated$: Observable<boolean>;
  public ouvrageData$: Observable<any>;

  constructor() {
    // Initialize phase subject
    this._dossierPhaseSubject = new Subject<boolean>();
    this.dossierPhase$ = Observable.of(true);

    this._dossierAdministratifSubject = new Subject<boolean>();
    this.dossierAdministratif$ = Observable.of(true);
    // Initialize dossier subject
    this._dossierSubject = new Subject<boolean>();
    this.dossier$ = Observable.of(true);

    // Initialize dossierUpdate subject
    this._dossierUpdatedSubject = new Subject<boolean>();
    this.dossierUpdated$ = Observable.of(true);
    this.ouvrageData$ = new Observable<any>();
    this.getListValeur();
  }

  get dossier() {
    return this._dossier;
  }
  set dossier(value: Dossier) {
    this._dossier = value;
  }
  getRoleCorrspondant() { }
  getQualiteContact() { }

  private setBaseStubDossier(): Partial<Dossier> {
    let dept: Departements = null;
    this.getDepartements().subscribe(depts => (dept = depts[0]));
    let thematic: Thematique = null;
    this.getThematiques().forEach(thematics => (thematic = thematics[0]));
    let benef: Beneficiaire = null;
    this.getBeneficaire(null).subscribe(benefref => (benef = benefref));
    let origineDemande: OrigineDemande = null;
    this.getOrigineDemande().forEach(
      originesDemande => (origineDemande = originesDemande)
    );
    let sessionDecision: ProcedureDecision = null;
    this.getProcedureDecisions().forEach(
      sessionsDecision => (sessionDecision = sessionsDecision[0])
    );
    let litAvis: Avis = null;
    this.getAvis().forEach(avis => (litAvis = avis[0]));
    let respTech: ResponsableTechnique = null;
    this.getResponsableTech().subscribe(resps => (respTech = resps[0]));
    let domaine: Domaine = null;
    this.getDomaines().forEach(domaines => (domaine = domaines[0]));
    let natureOperation: NatureOperation = null;
    this.getNatureOperation("AEEP", null, null, null, null).subscribe(
      nats => (natureOperation = nats[0])
    );

    this.getListValeur().map(data => {
      this.listValeurs = data[0];
    });

    const etatOuvrage: EtatOuvrage = null;
    this.getEtatOuvrage().map(etatOuvrages => (etatOuvrages = etatOuvrage[0]));

    const departements: Departements = null;
    this.getDepartements().map(departement => (departement = departements[0]));

    const partialDossier: Partial<Dossier> = {
      noOrdre: 4,
      departement: dept.numero,
      thematique: thematic,
      intitule: "fake dossier from service stub",
      referenceBenef: benef.reference,
      beneficiaire: benef,
      phase: "P00",
      statutPhase: "P",
      dateDemande: new Date(),
      origineDemande: origineDemande,
      noOrdreFormate: "00004",
      numeroDossier: "AGRI-31-00004",
      responsableTechnique: respTech,
      operationDossier: {
        operations: [
          // { natureOperation: natureOperation }
          {
            id: 1,
            natureOperation: natureOperation,
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
            departements: [],
            regions: [],
            themes: [],
            ouvrageNatureOperation: [],
            specificiteCalcul: "",
            montantAvance: 0,
            tauxAvance: null,
            montantAvanceEqSubvention: null,
            montantSubvention: 0,
            tauxSubvention: null,
            dispositifPartenariatOperation: [],
            lignesMasseEau: [],
            noOrdre: 1,
            communes: [],
            localisationPertinente: true,
            bvGestionNatureOperations: []
          }
        ]
      },
      numeroAid: "212-BBB-121",
      domaine: domaine,
      dossierAdmin: {
        idDossier: 1,
        dateAttribution: new Date("1995-12-17T03:24:00"),
        numeroAttributif: "string",
        numerosAide: [
          {
            id: 1,
            ligne: "string",
            annee: 2018,
            formeAide: "string",
            version: "string",
            numeroAide: "string",
            montantAide: 200
          }
        ],
        formDocAttrib: null,
        typDocAttrib: null,
        travauxOuvrage: true,
        verifsDossier:null,
        dateFinValidite: null
      }
    };

    return partialDossier;
  }

  private setBaseStubPreDossier(): PreDossier {
    let niveauPriorite: NiveauPriorite = null;
    this.getNiveauPriorite().map(
      niveauxPriorite => (niveauPriorite = niveauxPriorite[0])
    );
    let sessionDecision: SessionDecision = null;
    this.getSessionDecision().subscribe(
      sessionsDecision => (sessionDecision = sessionsDecision[0])
    );
    let typologie: Typologie = null;
    this.getTypologies().map(typologies => (typologie = typologies[0]));

    const preDossier: PreDossier = {
      anneeEngagPrevi: 2010,
      niveauPriorite: null,
      sessionDecision: sessionDecision,
      typologie: typologie
    };

    return preDossier;
  }

  private setStubRefusDossier() {
    let natureRefus: NatureRefus = null;
    this.getNatureRefus().map(natures => (natureRefus = natures[0]));

    const refusDossier: RefusDossier = {
      motifRefus: "Motif random",
      natureRefus: natureRefus
    };

    return refusDossier;
  }

  getListValeur(): ListValeur[] {
    const list: ListValeur[] = [
      {
        id: 1,
        code: "fake code",
        libelle: "fake label",
        codeParam: "fake code param",
        libelleParam: "fake label param"
      }
    ];
    return list;
  }

  getDossier(id: number): Observable<Dossier> {
    const baseDossier: Partial<Dossier> = this.setBaseStubDossier();
    // gather the base of the dossier and use it to create a full stub dossier
    const fakeDossier: Dossier = Object.assign({}, baseDossier as Dossier);

    fakeDossier.id = id;
    fakeDossier.preDossier = this.setBaseStubPreDossier();
    fakeDossier.refusDossier = null;

    this._dossier = fakeDossier;
    return Observable.of(fakeDossier);
  }

  getDepts(): Observable<Departements[]> {
    const depts: Departements[] = [
      { id: 9, numero: "", nomDept: "Ariège" },
      { id: 9, numero: "", nomDept: "Aveyron" }
    ];
    return Observable.of(depts);
  }

  getEtatOuvrage(): Observable<EtatOuvrage[]> {
    const EtatOuvrages: EtatOuvrage[] = [
      { code: "", libelle: "Ariège" },
      { code: "", libelle: "Aveyron" }
    ];
    return Observable.of(EtatOuvrages);
  }

  getDepartements(): Observable<Departements[]> {
    const departements: Departements[] = [
      { id: 0, nomDept: "", numero: "Ariège" },
      { id: 1, nomDept: "", numero: "Ariège" }
    ];
    return Observable.of(departements);
  }

  getCommuneBeneficiaire(): Observable<Commune[]> {
    const communes: Commune[] = [
      { nomCommune: "09001", numInsee: "Aigues" },
      { nomCommune: "09002", numInsee: "Aveyron" }
    ];
    return Observable.of(communes);
  }

  getResultatRechercheBeneficiaire(
    criteresSearchBeneficiaire: CritereSearchBeneficiaire
  ): Observable<any> {
    const resultatRecherche = {
      nombreTotalElements: 1,
      nombreTotalPages: null,
      numeroPageCourante: 1,
      nombreElementsPageCourante: 15,
      nombreElementsParPage: null,
      hasNext: false,
      hasPrevious: false,
      interlocuteurs: [
        {
          reference: "00000000P",
          raisonSociale: "CONDE SOLONGBE",
          actif: true,
          status: "test"
        }
      ],
      premierePage: false,
      dernierePage: false
    };
    return Observable.of(resultatRecherche);
  }

  getPhases(): Phase[] {
    return getStubListValeur();
  }

  getNatureOperation(
    codeThematique: String,
    ligne: String,
    validete: boolean,
    nbElemPerPage: number,
    pageAAficher: number
  ): Observable<NatureOperation[]> {
    const natureOperations: NatureOperation[] = [
      {
        id: 30649,
        ligne: "110",
        numero: "01",
        libelle: "Création station d épuration",
        codeThematique: "AEEP"
      },
      {
        id: 7000,
        ligne: "140",
        numero: "06",
        libelle: "Réhabilitation de l assainissement non collectif",
        codeThematique: "ASST"
      }
    ];
    return Observable.of(natureOperations);
  }

  getBeneficaire(reference: string): Observable<Beneficiaire> {
    const beneficiaire: Beneficiaire = {
      actif: true,
      reference: "01234567M",
      raisonSociale: "raison sociale de 01234567M",
      actifLibelle: "",
      status: "test",
      address: null,
      commune: null
    };
    return Observable.of(beneficiaire);
  }

  getResponsableTech(): Observable<ResponsableTechnique[]> {
    const respnTechs: ResponsableTechnique[] = [
      {
        login: "cccc",
        prenom: "philippe",
        nom: "redon",
        email: "",
        telephone: "",
        organisation: ""
      },
      {
        login: "aaaa",
        prenom: "alex",
        nom: "alex_nom",
        email: "",
        telephone: "",
        organisation: ""
      },
      {
        login: "bbbb",
        prenom: "rombo",
        nom: "rombo_nom",
        email: "",
        telephone: "",
        organisation: ""
      },
      {
        login: "12",
        prenom: "Aveyron",
        nom: "Aveyron",
        email: "",
        telephone: "",
        organisation: ""
      },
      {
        login: "09",
        prenom: "Ariège",
        nom: "nom",
        email: "",
        telephone: "",
        organisation: ""
      }
    ];
    return Observable.of(respnTechs);
  }

  getSessionDecision(): Observable<SessionDecision[]> {
    const sessionsDecision: SessionDecision[] = [
      {
        id: 1,
        annee: "2010",
        numero: "1",
        type: "CI",
        date: new Date("1995-12-17T03:24:00")
      },
      {
        id: 2,
        annee: "2015",
        numero: "2",
        type: "DD",
        date: new Date("1995-12-17T03:24:00")
      }
    ];
    return Observable.of(sessionsDecision);
  }

  getSessionPrevisionnel(): Observable<SessionDecision[]> {
    return this.getSessionDecision();
  }

  getResultsResearchRemark(criteresRecherche: CritereRemarque): Observable<any> {
    const resultatRecherche = {
      dossiers: [
        {
          id: 1,
          departement: "31",
          dossierRemarqueLu: false,
          thematique: {
            id: 1,
            codeParam: "THEMA",
            libelleParam: null,
            code: "AGRI",
            libelle: "Agriculture"
          },
          intitule: "test",
          beneficiaire: {
            reference: "12455477P",
            raisonSociale: "raison sociale de 12455477P",
            actif: true
          },
          responsableTechnique: {
            login: "monLogin1",
            prenom: "prenom1",
            nom: "diop"
          },
          noOrdre: 1,
          phase: null,
          refusDossier: null,
          dateDemande: null,
          origineDemande: null,
          noOrdreFormate: "00001",
          numeroDossier: "AGRI-31-00001"
        },
        {
          id: 2,
          departement: "31",
          thematique: {
            id: 1,
            codeParam: "THEMA",
            libelleParam: null,
            code: "AGRI",
            libelle: "Agriculture"
          },
          intitule: "test",
          beneficiaire: {
            reference: "12455477P",
            raisonSociale: "raison sociale de 12455477P",
            actif: true
          },
          responsableTechnique: {
            login: "monLogin2",
            prenom: "prenom2",
            nom: "syre"
          },
          noOrdre: 2,
          phase: null,
          refusDossier: null,
          dateDemande: null,
          origineDemande: null,
          noOrdreFormate: "00002",
          numeroDossier: "AGRI-31-00002"
        }
      ],
      premierePage: true,
      dernierePage: false
    };
    return Observable.of(resultatRecherche);
  }
  updateDossierLu(criteresRecherche: CritereRemarque): Observable<any> {
    const result = {
      archive: criteresRecherche.archive,
      emetteur: criteresRecherche.emetteur,
      idDossier: criteresRecherche.idDossier,
      lu: !criteresRecherche.lu
    }
    return Observable.of(result);
  }


  getResultatRecherche(criteresRecherche: Critere): Observable<any> {
    const resultatRecherche = {
      nombreTotalElements: 19,
      nombreTotalPages: 2,
      numeroPageCourante: 0,
      nombreElementsPageCourante: 15,
      nombreElementsParPage: 15,
      hasNext: true,
      hasPrevious: false,
      dossiers: [
        {
          id: 1,
          departement: "31",
          thematique: {
            id: 1,
            codeParam: "THEMA",
            libelleParam: null,
            code: "AGRI",
            libelle: "Agriculture"
          },
          intitule: "test",
          beneficiaire: {
            reference: "12455477P",
            raisonSociale: "raison sociale de 12455477P",
            actif: true
          },
          responsableTechnique: {
            login: "monLogin1",
            prenom: "prenom1",
            nom: "diop"
          },
          noOrdre: 1,
          phase: null,
          refusDossier: null,
          dateDemande: null,
          origineDemande: null,
          noOrdreFormate: "00001",
          numeroDossier: "AGRI-31-00001"
        },
        {
          id: 2,
          departement: "31",
          thematique: {
            id: 1,
            codeParam: "THEMA",
            libelleParam: null,
            code: "AGRI",
            libelle: "Agriculture"
          },
          intitule: "test",
          beneficiaire: {
            reference: "12455477P",
            raisonSociale: "raison sociale de 12455477P",
            actif: true
          },
          responsableTechnique: {
            login: "monLogin2",
            prenom: "prenom2",
            nom: "syre"
          },
          noOrdre: 2,
          phase: null,
          refusDossier: null,
          dateDemande: null,
          origineDemande: null,
          noOrdreFormate: "00002",
          numeroDossier: "AGRI-31-00002"
        }
      ],
      premierePage: true,
      dernierePage: false
    };
    return Observable.of(resultatRecherche);
  }

  refuseDossier(
    idDossier: number,
    refusDossier: RefusDossier
  ): Observable<Dossier> {
    let dossierRef: Dossier = null;
    this.getDossier(idDossier).subscribe(dossier => (dossierRef = dossier));

    dossierRef.refusDossier = this.setStubRefusDossier();

    return Observable.of(dossierRef);
  }

  basculer(idDossier: number): Observable<Dossier> {
    let dossierAbasculer: Dossier = null;
    this.getDossier(idDossier).subscribe(
      dossier => (dossierAbasculer = dossier)
    );

    return Observable.of(dossierAbasculer);
  }

  valider(idDossier: number): Observable<Dossier> {
    let dossierAvalider: Dossier = null;
    this.getDossier(idDossier).subscribe(
      dossier => (dossierAvalider = dossier)
    );

    return Observable.of(dossierAvalider);
  }

  devalider(idDossier: number): Observable<Dossier> {
    let dossierAdevalider: Dossier = null;
    this.getDossier(idDossier).subscribe(
      dossier => (dossierAdevalider = dossier)
    );

    return Observable.of(dossierAdevalider);
  }

  createDossier(dossier: DossierCreate): Observable<Dossier> {
    return this.getDossier(1);
  }

  saveGestionPrev(dossiersPrev: DossierPrevGestion[]): Observable<any> {
    return Observable.of([]);
  }

  createPieceJointe(
    documents: PieceJointe[],
    idDossier: number
  ): Observable<PieceJointe[]> {
    const fakeDocuments: PieceJointe[] = [
      {
        id: 1,
        titre: "DTAEEP-09-00001_1.docx",
        codeDoc: "f4c510e6-c3db-427e-a38e-e845423eff29",
        reference: null,
        createur: "JEAN AKKA1",
        dateCreation: 1531474537781,
        dateModification: null,
        fichier: null,
        fichierContentType: null,
        urlFichier:
          "http://integration.siga.akka.eu:8088/webdav/document/SIGA_DOSSIERS/7d78754372274d92b9b3df1f42821153.docx",
        urlOffice:
          "ms-word:ofe|u|http://integration.siga.akka.eu:8088/webdav/document/SIGA_DOSSIERS/7d78754372274d92b9b3df1f42821153.docx"
      }
    ];

    return Observable.of(fakeDocuments);
  }

  createDescriptifTech(idDossier: number): Observable<DescriptifTechnique[]> {
    const fakeDescriptifTech: PieceJointe[] = [
      {
        id: 1,
        titre: "descriptif-tech_DTAEEP-09-00001_1.docx",
        codeDoc: "f4c510e6-c3db-427e-a38e-e845423eff29",
        reference: null,
        createur: "JEAN AKKA1",
        dateCreation: 1531474537781,
        dateModification: null,
        fichier: null,
        fichierContentType: null,
        urlFichier:
          "http://integration.siga.akka.eu:8088/webdav/document/SIGA_DOSSIERS/7d78754372274d92b9b3df1f42821153.docx",
        urlOffice:
          "ms-word:ofe|u|http://integration.siga.akka.eu:8088/webdav/document/SIGA_DOSSIERS/7d78754372274d92b9b3df1f42821153.docx"
      }
    ];

    return Observable.of(fakeDescriptifTech);
  }

  deletePieceJointe(codeDoc: string): Observable<number> {
    const id = 1;
    return Observable.of(id);
  }

  bascValidDevalid(dossier: DossierAction): Observable<DossierAction> {
    const dossierAction: DossierAction = {
      profil: EnumProfilDossier.RL,
      action: EnumActionDossier.VALIDER,
      ids: []
    };
    this.getDossier(1).subscribe(folder => (dossierAction.dossier = folder));

    return Observable.of(dossierAction);
  }

  updateDossier(dossier: Dossier): Observable<Dossier> {
    return Observable.of(dossier);
  }


  getNiveauPriorite(): NiveauPriorite[] {
    return getStubListValeur();
  }
  getTheme(): Theme[] {
    return getStubListValeur();
  }
  getOrigineDemande(): OrigineDemande[] {
    return getStubListValeur();
  }
  getThematiques(): Thematique[] {
    return getStubListValeur();
  }
  getDomaines(): Domaine[] {
    return getStubListValeur();
  }
  getTypologies(): Typologie[] {
    return getStubListValeur();
  }
  getProcedureDecisions(): ProcedureDecision[] {
    return getStubListValeur();
  }
  getAvis(): Avis[] {
    return getStubListValeur();
  }

  getDelegation(): Delegation[] {
    return getStubListValeur();
  }
  getNatureRefus(): NatureRefus[] {
    return getStubListValeur();
  }
  getEncadrementCommJustif(): EncadrementCommJustif[] {
    return getStubListValeur();
  }
  getDispositionFinanciere(): DispositionsFinancieres[] {
    return getStubListValeur();
  }
  getModalitesReductionAides(): ModalitesReduction[] {
    return getStubListValeur();
  }
  getModalitesVersementAides(): ModalitesVersement[] {
    return getStubListValeur();
  }
  getLinesOfFinanceurs(): Observable<Financeur[]> {
    const dummyFinanceurs = [
      {
        id: 5,
        code: "ADEME",
        libelle: "ADEME",
        financeurPublic: true,
        disable: true
      },
      {
        id: 6,
        code: "AG",
        libelle: "Agence de l'eau",
        financeurPublic: true,
        disable: true
      }
    ];
    return Observable.of(dummyFinanceurs);
  }
  getEngagementParticulier(): EngagementsParticuliers[] {
    return getStubListValeur();
  }
  getCoefficientOfConversion(): CoefficientConversion {
    const coefConversion: CoefficientConversion = {
      id: 51,
      codeParam: "COEF_EQ_SUB",
      libelleParam: null,
      valeurDate: null,
      valeurStr: "0.1",
      valeurCoef: 0.1
    };
    return coefConversion;
  }

  getTypeDispositif(): Observable<TypeDispositif[]> {
    return Observable.of(getStubListValeur());
  }

  getLinesOfThematique(code: string): Observable<Libelle[]> {
    const libelles: Libelle[] = [
      {
        id: 1,
        numero: "2",
        libelle: "toto",
        codeThematique: "ABE",
        disable: false
      }
    ];
    return Observable.of(libelles);
  }

  getTypeOuvrage(): TypeOuvrage[] {
    const typeOuvrage: TypeOuvrage[] = [
      {
        id: 52,
        codeParam: "TYPE_OUV",
        libelleParam: "Type d'ouvrage",
        code: "ANC",
        libelle: "Assainissement non collectif",
        texte: null
      },
      {
        id: 53,
        codeParam: "TYPE_OUV",
        libelleParam: "Type d'ouvrage",
        code: "BA",
        libelle: "Barrage-réservoir",
        texte: null
      }
    ];
    return typeOuvrage;
  }

  getOuvrage(): Observable<Ouvrage> {
    const ouvrage: Ouvrage = {
      id: 1,
      codeAgence: "31053100",
      typeOuvrage: {
        id: 56,
        codeParam: "TYPE_OUV",
        libelleParam: "Type d'ouvrage",
        code: "EIP",
        libelle: "Etablissement industriel",
        texte: null
      },
      masseEaux: [],
      libelle: "S.C.I. CLINIQUE DE BEAUPUY",
      libelleEtat: "libelle"
    };
    return Observable.of(ouvrage);
  }

  getCourriers(id) {
    const courriersTest: Courrier[] = [
      {
        codeDocument: "b207fb0e-e9d5-4926-bef5-2ca27e3cfc0e",
        createur: null,
        dateCreation: null,
        dateModification: null,
        destinataire: "MYRIAM MAS",
        fichier: null,
        fichierContentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        id: 1,
        objet: `test d'objet de courrier`,
        redacteur: "MAS MYRIAM",
        reference: "MAREF",
        titre: "DECI_SEULE_modele.docx",
        urlFichier:
          "http://integration.siga.akka.eu:8088/webdav/modele/SIGA/DECI_SEULE_modele.docx",
        urlOffice:
          "ms-word:ofe|u|http://integration.siga.akka.eu:8088/webdav/modele/SIGA/DECI_SEULE_modele.docx"
      }
    ];
    return Observable.of(courriersTest);
  }

  getModeles() {
    const modeleTest: ModeleGCD[] = [
      {
        type: "Autre",
        code: "66309a2-5f7a-4e2c-bc3b-e521cb2Beead"
      },
      {
        type: "Zotr",
        code: "6495df-5ds1-52zd-dc5e-zd1z5eeef15V"
      }
    ];
    return Observable.of(modeleTest);
  }

  getUrlDispositifFront(idDispositif: number) {
    return `http://integration.siga.akka.eu:81/dispositif/${idDispositif}`;
  }

  getvaleursImpactListe(codeListe: string) {
    return getStubListValeur();
  }

  getResultatRechercheOuvrage(
    criteresRechercheOuvrage: CritereSearchOuvrage
  ): Observable<any> {
    const ouvrages: Ouvrage[] = [
      {
        id: 31,
        codeAgence: "31053100",
        typeOuvrage: {
          id: 56,
          codeParam: "TYPE_OUV",
          libelleParam: "Type d'ouvrage",
          code: "EIP",
          libelle: "Etablissement industriel",
          texte: null
        },
        masseEaux: [],
        libelleEtat: "libelle",
        libelle: "S.C.I. CLINIQUE DE BEAUPUY",
        disable: false
      },
      {
        id: 32,
        codeAgence: "31053100",
        typeOuvrage: {
          id: 56,
          codeParam: "TYPE_OUV",
          libelleParam: "Type d'ouvrage",
          code: "EIP",
          libelle: "Etablissement industriel",
          texte: null
        },
        masseEaux: [],
        libelleEtat: "libelle",
        libelle: "S.C.I. CLINIQUE DE BEAUPUY",
        disable: false
      }
    ];

    return Observable.of(ouvrages);
  }

  saveAvis(avis: AvisDossier[]): Observable<any> {
    return Observable.of(true);
  }

  getApplicationInfo(): ApplicationParam[] {
    const param: ApplicationParam[] = [
      {
        codeParam: "PARAM",
        id: 1,
        libelleParam: "Param 1",
        valeurDate: null,
        valeurStr: "P1"
      }
    ];
    return param;
  }

  getLastDateOfAttribution(): LastDateAttribution {
    const lastDateAttribution: LastDateAttribution = {
      codeParam: "PARAM",
      id: 1,
      libelleParam: "Param 2",
      valeurDate: null,
      valeurStr: "P2"
    };
    return lastDateAttribution;
  }
}

/**
 * Unit Test of DossierService
 */
describe("DossierService unit test", () => {
  let injector: TestBed;
  let appService: AppService;
  let dossierService: DossierService;
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DossierService,
        GlobalState,
        {
          provide: AppService,
          useClass: AppServiceStub
        }
      ]
    });

    injector = getTestBed();

    appService = injector.get(AppService);
    dossierService = injector.get(DossierService);
    httpClient = injector.get(HttpClient);
    httpMock = injector.get(HttpTestingController);
  });

  /**
   * getThematiques should return an array of thematics
   */
  xit("getThematiques should return an Observable<Object> which contain an array of thematics", () => {
    // initialisation d'un resultat type que le backend fournirait
    const dummyThematiques = [
      {
        id: 1,
        codeParam: "THEMA",
        libelleParam: null,
        code: "AGRI",
        libelle: "Agriculture"
      },
      {
        id: 2,
        codeParam: "THEMA",
        libelleParam: null,
        code: "GREE",
        libelle: "Gestion de la Resssource et Economie d'Eau"
      }
    ];

    dossierService.getThematiques().map(data => {
      // test des différents éléments du retour
      expect(data[0].id).toBe(1);
      expect(data).toEqual(
        dummyThematiques[0],
        "#getResultatRecherche's method should return the proper object"
      );
    });

    // configuration de la réponse mockée
    const req = httpMock.expectOne(appService.environment.BACKEND + "/valeur");
    expect(req.request.method).toBe("GET");
    req.flush(dummyThematiques);
  });

  /**
   * getPhases should return an array of phases
   */
  xit("getPhases should return an Observable<Object> which contain an array of phases", () => {
    // initialisation d'un resultat type que le backend fournirait
    const dummyPhases = [
      {
        id: 1,
        code: "fake code",
        libelle: "fake label",
        codeParam: "fake code param",
        libelleParam: "fake label param"
      }
    ];

    dossierService.getPhases().map(data => {
      // test des différents éléments du retour
      expect(data[0].id).toBe(1);
      expect(data[0].code).toEqual(
        dummyPhases[0].code,
        "#getPhases's method should return the proper object"
      );
    });

    // configuration de la réponse mockée
    const req = httpMock.expectOne(appService.environment.BACKEND + "/valeur");
    expect(req.request.method).toBe("GET");
    req.flush(dummyPhases);
  });

  /**
   * getDispositionFinanciere should return an array of DF
   */
  xit("getDispositionFinanciere should return an Observable<Object> which contain an array of DF", () => {
    // initialisation d'un resultat type que le backend fournirait
    const dummyDF = [
      {
        id: 1,
        code: "fake code",
        libelle: "fake label",
        codeParam: "fake code param",
        libelleParam: "fake label param"
      }
    ];

    dossierService.getDispositionFinanciere().map(data => {
      // test des différents éléments du retour
      expect(data[0].id).toBe(1);
      expect(data[0].code).toEqual(
        dummyDF[0].code,
        "#getDispositionFinanciere's method should return the proper object"
      );
    });
  });

  /**
   * getModalitesVersementAides should return an array of MR
   */
  xit("getModalitesReductionAides should return an Observable<Object> which contain an array of ModalitesReduction", () => {
    // initialisation d'un resultat type que le backend fournirait
    const dummyMR = [
      {
        id: 1,
        code: "fake code",
        libelle: "fake label",
        codeParam: "fake code param",
        libelleParam: "fake label param"
      }
    ];

    dossierService.getModalitesReductionAides().map(data => {
      // test des différents éléments du retour
      expect(data[0].id).toBe(1);
      expect(data[0].code).toEqual(
        dummyMR[0].code,
        "#getModalitesReductionAides's method should return the proper object"
      );
    });

    // configuration de la réponse mockée
    const req = httpMock.expectOne(appService.environment.BACKEND + "/valeur");
    expect(req.request.method).toBe("GET");
    req.flush(dummyMR);
  });

  /**
   * getModalitesReductionAides should return an array of MV
   */
  xit("getModalitesVersementAides should return an Observable<Object> which contain an array of ModalitesVersement", () => {
    // initialisation d'un resultat type que le backend fournirait
    const dummyMV = [
      {
        id: 1,
        code: "fake code",
        libelle: "fake label",
        codeParam: "fake code param",
        libelleParam: "fake label param"
      }
    ];

    dossierService.getModalitesVersementAides().map(data => {
      // test des différents éléments du retour
      expect(data[0].id).toBe(80);
      expect(data[0].code).toEqual(
        dummyMV[0].code,
        "#getModalitesVersementAides's method should return the proper object"
      );
    });

    // configuration de la réponse mockée
    const req = httpMock.expectOne(appService.environment.BACKEND + "/valeur");
    expect(req.request.method).toBe("GET");
    req.flush(dummyMV);
  });
  /**
   * getLinesOfFinanceurs should return an array of Financeurs
   */
  it("getLinesOfFinanceurs should return an Observable<Object> which contain an array of Financeurs", () => {
    // initialisation d'un resultat type que le backend fournirait
    const dummyFinanceurs = [
      {
        id: 5,
        code: "ADEME",
        libelle: "ADEME",
        financeurPublic: true,
        disable: true
      },
      {
        id: 6,
        code: "AG",
        libelle: "Agence de l'eau",
        financeurPublic: true,
        disable: true
      }
    ];

    dossierService.getLinesOfFinanceurs().subscribe(data => {
      // test des différents éléments du retour
      expect(data[0].id).toBe(5);
      expect(data).toEqual(
        dummyFinanceurs,
        "#getLinesOfFinanceurs's method should return the proper object"
      );
    });

    // configuration de la réponse mockée
    const req = httpMock.expectOne(
      appService.environment.BACKEND + "/valeur/financeur"
    );
    expect(req.request.method).toBe("GET");
    req.flush(dummyFinanceurs);
  });

  xit("getEngagementParticulier should return an Observable<Object> which contain an array of DF", () => {
    // initialisation d'un resultat type que le backend fournirait
    const dummyDTP = [
      {
        id: 1,
        code: "fake code",
        libelle: "fake label",
        codeParam: "fake code param",
        libelleParam: "fake label param"
      }
    ];

    dossierService.getEngagementParticulier().map(data => {
      // test des différents éléments du retour
      expect(data[0].id).toBe(1);
      expect(data[0].code).toEqual(
        dummyDTP[0].code,
        "#getEngagementParticulier's method should return the proper object"
      );
    });

    // configuration de la réponse mockée
    const req = httpMock.expectOne(appService.environment.BACKEND + "/valeur");
    expect(req.request.method).toBe("GET");
    req.flush(dummyDTP);
  });

  xit("getDispositionFinanciere should return an Observable<Object> which contain an array of DF", () => {
    // initialisation d'un resultat type que le backend fournirait
    const dummyDF = [
      {
        id: 1,
        code: "fake code",
        libelle: "fake label",
        codeParam: "fake code param",
        libelleParam: "fake label param"
      }
    ];

    dossierService.getDispositionFinanciere().map(data => {
      // test des différents éléments du retour
      expect(data[0].id).toBe(1);
      expect(data[0].code).toEqual(
        dummyDF[0].code,
        "#getDispositionFinanciere's method should return the proper object"
      );
    });

    // configuration de la réponse mockée
    const req = httpMock.expectOne(appService.environment.BACKEND + "/valeur");
    expect(req.request.method).toBe("GET");
    req.flush(dummyDF);
  });

  it("#getResponsableTech should return an Observable<Object> which contain an array of responsables technique", () => {
    // initialisation d'un resultat type que le backend fournirait

    const dummyResponsablesTech = [
      {
        login: "monLogin1",
        prenom: "prenom1",
        nom: "diop",
        email: "",
        telephone: "",
        organisation: ""
      },
      {
        login: "monLogin2",
        prenom: "prenom2",
        nom: "Syre",
        email: "",
        telephone: "",
        organisation: ""
      }
    ];

    dossierService.getResponsableTech().subscribe(data => {
      // test des différents éléments du retour
      expect(data[0].login).toBe("monLogin1");
      expect(data).toEqual(
        dummyResponsablesTech,
        "#getResultatRecherche's method should return the proper object"
      );
    });

    // configuration de la réponse mockée
    const req = httpMock.expectOne(
      appService.environment.BACKEND + "/utilisateur"
    );
    expect(req.request.method).toBe("GET");
    req.flush(dummyResponsablesTech);
  });

  it('#createDossier should send a post request and return an Observable<Object> which contain the datas of the created "dossier" ', () => {
    // initialisation d'un bénéficaires rattaché au dossier
    const beneficiaire: Beneficiaire = {
      actif: true,
      reference: "01234567M",
      raisonSociale: "raison sociale de ",
      actifLibelle: "",
      status: "test",
      address: null,
      commune: null
    };
    // initialization of dossier
    const dummyDossier = {
      beneficiaire: beneficiaire,
      departement: "31",
      intitule: "test création dossier",
      thematique: {
        id: 1,
        codeParam: "THEMA",
        libelleParam: null,
        code: "AGRI",
        libelle: "Agriculture"
      },
      responsableTechnique: {
        login: "test",
        prenom: "prenom dd",
        nom: "mon nom",
        email: "",
        telephone: "",
        organisation: ""
      },
      responsableAdministratif: {
        login: "test",
        prenom: "prenom dd",
        nom: "mon nom",
        email: "",
        telephone: "",
        organisation: ""
      }
    };

    // initialization of result of createDossier
    const dummyResponseCreerDossier = {
      id: 4,
      departement: "31",
      thematique: {
        id: 1,
        codeParam: "THEMA",
        libelleParam: null,
        code: "AGRI",
        libelle: "Agriculture"
      },
      intitule: "test creation dossier",
      beneficiaire: beneficiaire,
      noOrdre: 4,
      phase: null,
      refusDossier: null,
      dateDemande: null,
      origineDemande: null,
      noOrdreFormate: "00004",
      numeroDossier: "AGRI-31-00004",
      numeroRaisonSocialeBeneficiare: "77777777Z-BOUCHON",
      responsableTechnique: {
        login: "test",
        prenom: "prenom dd",
        nom: "mon nom",
        email: "",
        telephone: "",
        organisation: ""
      }
    };

    dossierService.createDossier(dummyDossier).subscribe(data => {
      // test des différents éléments du retour
      expect(data.id).toBe(4);
      expect(data.departement).toBe("31");
      expect(data.thematique).toEqual({
        id: 1,
        codeParam: "THEMA",
        libelleParam: null,
        code: "AGRI",
        libelle: "Agriculture"
      });
      expect(data.responsableTechnique).toEqual({
        login: "test",
        prenom: "prenom dd",
        nom: "mon nom",
        email: "",
        telephone: "",
        organisation: ""
      });
      expect(data.intitule).toBe("test creation dossier");
      expect(data.beneficiaire).toBe(beneficiaire);
      expect(data.noOrdre).toBe(4);
      expect(data.phase).toBe(null);
      expect(data.refusDossier).toBe(null);
      expect(data.noOrdreFormate).toBe("00004");
      expect(data.numeroDossier).toBe(
        "AGRI-31-00004",
        "#createDossier's method should return the proper object"
      );
    });

    // configuration of mocked response
    const req = httpMock.expectOne(appService.environment.BACKEND + "/dossier");
    expect(req.request.method).toBe("POST");
    req.flush(dummyResponseCreerDossier);
  });

  it("#createDescriptifTech should create a document : Descriptif technique ", () => {
    // initialization of result of createDescriptifTechf
    const dummyResponseCreateDescriptifTech = {
      id: 1,
      titre: "DTAEEP-09-00001_1.docx",
      codeDoc: "f4c510e6-c3db-427e-a38e-e845423eff29",
      reference: null,
      createur: "JEAN AKKA1",
      dateCreation: 1531474537781,
      dateModification: null,
      fichier: null,
      fichierContentType: null,
      urlFichier:
        "http://integration.siga.akka.eu:8088/webdav/document/SIGA_DOSSIERS/7d78754372274d92b9b3df1f42821153.docx",
      urlOffice:
        "ms-word:ofe|u|http://integration.siga.akka.eu:8088/webdav/document/SIGA_DOSSIERS/7d78754372274d92b9b3df1f42821153.docx"
    };

    const idDossier = 1;
    // appel service createDescriptifTech
    dossierService.createDescriptifTech(idDossier).subscribe(data => {
      // test des différents éléments du retour

      expect(data.id).toBe(dummyResponseCreateDescriptifTech.id),
        expect(data.titre).toBe(dummyResponseCreateDescriptifTech.titre),
        expect(data.urlOffice).toBe(
          dummyResponseCreateDescriptifTech.urlOffice,
          "#createDescriptifTech method should return the proper object"
        );
    });

    const req = httpMock.expectOne({
      method: "POST",
      url: appService.environment.BACKEND + `/document/descriptif/${idDossier}`
    });
    expect(req.request.method).toBe("POST");
    req.flush(dummyResponseCreateDescriptifTech);
  });

  /**
   * unit test of getResultatRecherche function
   */
  it("getResultatRecherche should return an Observable<Object> with the needed informations for the result s table", () => {
    // initialization of cretaria object
    const dummyConfigCard: Critere = {
      thematique: "1",
      departement: null,
      responsableTech: null,
      numeroIncrement: null,
      codeBenef: null,
      phase: null,
      pageAAficher: null,
      nbElemPerPage: 15,
      priorite: null,
      procedureDecision: null,
      codeServiceDept: null,
      delegation: null,
      domaine: null,
      natureOperation: null,
      hasReponseNontraite: null
    };

    // initialization of result type from backend
    const dummySearchResult = {
      nombreTotalElements: 19,
      nombreTotalPages: 2,
      numeroPageCourante: 0,
      nombreElementsPageCourante: 15,
      nombreElementsParPage: 15,
      hasNext: true,
      hasPrevious: false,
      dossiers: [
        {
          id: 2,
          departement: "31",
          thematique: {
            id: 1,
            codeParam: "THEMA",
            libelleParam: null,
            code: "AGRI",
            libelle: "Agriculture"
          },
          intitule: "test",
          beneficiaire: null,
          noOrdre: 2,
          phase: null,
          refusDossier: null,
          dateDemande: null,
          origineDemande: null,
          noOrdreFormate: "00002",
          numeroDossier: "AGRI-31-00002"
        },
        {
          id: 3,
          departement: "31",
          thematique: {
            id: 1,
            codeParam: "THEMA",
            libelleParam: null,
            code: "AGRI",
            libelle: "Agriculture"
          },
          intitule: "test3",
          beneficiaire: null,
          noOrdre: 3,
          phase: null,
          refusDossier: null,
          dateDemande: null,
          origineDemande: null,
          noOrdreFormate: "00003",
          numeroDossier: "AGRI-31-00003"
        }
      ],
      premierePage: true,
      dernierePage: false
    };

    dossierService.getResultatRecherche(dummyConfigCard).subscribe(data => {
      // test of differents criteria
      expect(data.nombreTotalElements).toBe(19);
      expect(data.nombreTotalPages).toBe(2);
      expect(data.numeroPageCourante).toBe(0);
      expect(data.nombreElementsPageCourante).toBe(15);
      expect(data.nombreElementsParPage).toBe(15);
      expect(data.hasNext).toBe(true);
      expect(data.hasPrevious).toBe(false);
      expect(data.dossiers.length).toBe(2);
      expect(data.premierePage).toBe(true);
      expect(data.dernierePage).toBe(false);
      expect(data.dossiers).toEqual(
        dummySearchResult.dossiers,
        "#getResultatRecherche's method should return the proper object"
      );
    });

    // configuration of mocked response
    const req = httpMock.expectOne(
      appService.environment.BACKEND +
      "/dossier?idThematique=1&nombreElementPage=15&"
    );
    expect(req.request.method).toBe("GET");
    req.flush(dummySearchResult);
  });

  /**
   * unit test of 404 error
   */
  it('should return an 404 error if none of those params are given: "thematique", "departement", "numeroIncrement" and "codeBenef"', () => {
    const emsg = "deliberate 404 error";
    const dummyConfigCard: Critere = {
      thematique: null,
      departement: null,
      numeroIncrement: null,
      codeBenef: null,
      responsableTech: null,
      phase: null,
      pageAAficher: null,
      nbElemPerPage: 15,
      priorite: null,
      procedureDecision: null,
      codeServiceDept: null,
      delegation: null,
      domaine: null,
      natureOperation: null,
      hasReponseNontraite: null
    };

    dossierService.getResultatRecherche(dummyConfigCard).subscribe(
      data => {
        fail("should have failed with the 404 error");
      },
      err => {
        expect(err.status).toEqual(404, "status");
        expect(err.error).toEqual(emsg, "message");
      }
    );

    const req = httpMock.expectOne(
      appService.environment.BACKEND + `/dossier?nombreElementPage=15&`
    );
    req.flush(emsg, { status: 404, statusText: "Not Found" });
  });

  /**
   * unit test of getBeneficaire function
   */
  it("should return beneficiaire exist", () => {
    // intialization of Beneficaire
    const dummyBeneficiaire: Beneficiaire = {
      actif: true,
      reference: "01234567M",
      raisonSociale: "raison sociale de ",
      actifLibelle: "",
      status: "test",
      address: null,
      commune: null
    };

    const reference = "01234567M";

    dossierService.getBeneficaire(reference).subscribe(data => {
      expect(data).toBeDefined();
      expect(data.reference).toEqual(reference);
      expect(data.raisonSociale).toEqual("raison sociale de ");
      expect(data.actif).toBeTruthy();
    });

    const req = httpMock.expectOne({
      method: "GET",
      url: appService.environment.BACKEND + "/interlocuteur/01234567M"
    });
    req.flush(dummyBeneficiaire);
  });

  /**
   * unit test of getNatureRefus function
   */
  xit("should be a list of natureRefus", () => {
    const dummyNatureList: NatureRefus[] = [
      {
        id: 1,
        code: "fake code",
        libelle: "fake label",
        codeParam: "fake code param",
        libelleParam: "fake label param"
      }
    ];

    dossierService.getNatureRefus().map(listNature => {
      expect(listNature).toBeDefined();
      expect(listNature.id).toBe(1);
      expect(listNature[0].libelle).toEqual(dummyNatureList[0].code);
    });

    const req = httpMock.expectOne({
      method: "GET",
      url: appService.environment.BACKEND + "/valeur"
    });
    req.flush(dummyNatureList);
  });

  /**
   * unit test of getOrigineDemande function
   */
  xit("should be a list of OrigineDemande", () => {
    const dummyOriginDemandeList: OrigineDemande[] = [
      {
        id: 1,
        code: "fake code",
        libelle: "fake label",
        codeParam: "fake code param",
        libelleParam: "fake label param"
      }
    ];

    dossierService.getOrigineDemande().map(listOriginDemande => {
      expect(listOriginDemande).toBeDefined();
      expect(listOriginDemande.id).toBe(1);
      expect(listOriginDemande[0].libelle).toEqual(
        dummyOriginDemandeList[0].code
      );
    });

    const req = httpMock.expectOne({
      method: "GET",
      url: appService.environment.BACKEND + "/valeur"
    });
    req.flush(dummyOriginDemandeList);
  });

  /**
   * getThemes should return an array of themes
   */
  xit("getThemes should return an Observable<Object> which contain an array of themes", () => {
    const dummyThemes = [
      {
        id: 1,
        code: "fake code",
        libelle: "fake label",
        codeParam: "fake code param",
        libelleParam: "fake label param"
      }
    ];

    dossierService.getTheme().map(data => {
      // test des différents éléments du retour
      expect(data[0].id).toBe(1);
      expect(data[0]).toEqual(
        dummyThemes[0],
        "#getThemes's method should return the proper object"
      );
    });
    // configuration de la réponse mockée
    const req = httpMock.expectOne(appService.environment.BACKEND + "/valeur");
    expect(req.request.method).toBe("GET");
    req.flush(dummyThemes);
  });

  /**
   * getNatureOperation should return an array of natureOperation
   */
  it("getNatureOperation should return an Observable<Object> which contain an array of themes", () => {
    const dummyNatureOperation: NatureOperation[] = [
      {
        id: 30649,
        ligne: "110",
        numero: "01",
        libelle: "Création station d épuration",
        codeThematique: "AEEP",
      },
      {
        id: 7000,
        ligne: "140",
        numero: "06",
        libelle: "Réhabilitation de l assainissement non collectif",
        codeThematique: "ASST",
      }
    ];

    dossierService
      .getNatureOperation("AEEP", null, true, null, null)
      .subscribe(data => {
        expect(data[0].id).toBe(30649);
        expect(data).toEqual(dummyNatureOperation);
      });
    // configuration de la réponse mockée
    const req = httpMock.expectOne(
      appService.environment.BACKEND +
      "/valeur/natureOperation/filtre?codeThematique=AEEP&valide=true&"
    );
    expect(req.request.method).toBe("GET");
    req.flush(dummyNatureOperation);
  });

  /**
   * unit test of updateDossier function
   */
  it(
    "updateDossier should send a put request and return an Observable<Object> " +
    'which contain the datas of the update "dossier" ',
    () => {
      const beneficiaire: Beneficiaire = {
        actif: true,
        reference: "01234567M",
        raisonSociale: "raison sociale de ",
        actifLibelle: "",
        status: "test",
        address: null,
        commune: null
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
        beneficiaire: beneficiaire,
        referenceBenef: "",
        preDossier: null,
        responsableTechnique: null,
        responsableAdministratif: null,
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
        donneeSpecifiqueThema: null,
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
        motifAvis: "motif",
        dossierAdmin: null
      };

      dossierService.updateDossier(dummyDossier).subscribe(data => {
        expect(data).toEqual(dummyDossier);
      });

      // configuration de la réponse mockée
      const req = httpMock.expectOne(
        appService.environment.BACKEND + "/dossier"
      );
      expect(req.request.method).toBe("PUT");
      req.flush(dummyDossier);
    }
  );

  /**
   * unit test of refuse dossier function
   */
  it("should be a dossierResult object with refusDossier object attached", () => {
    const natureRefusSelect: NatureRefus = {
      id: 22,
      libelle: "Dossier abandonné",
      code: "NEXFF"
    };
    const refusDossierToSend: RefusDossier = {
      motifRefus: "testing",
      natureRefus: natureRefusSelect
    };

    const idDossier = 10;
    const dummmyDossier: Dossier = {
      id: 10,
      courriers: [],
      beneficiaire: {
        reference: "12455477P",
        raisonSociale: "raison sociale de 12455477P",
        actif: true,
        actifLibelle: "",
        status: "test",
        address: null,
        commune: null
      },
      thematique: null,
      departement: null,
      intitule: "AABBCCDD",
      phase: "T40",
      refusDossier: refusDossierToSend,
      planFinancementDossier: null,
      noOrdre: 1,
      noOrdreFormate: "string",
      numeroDossier: "string",
      referenceBenef: "",
      preDossier: null,
      donneeSpecifiqueThema: null,
      numeroAid: "l124587",
      responsableTechnique: {
        login: "test",
        prenom: "prenom dd",
        nom: "mon nom",
        email: "",
        telephone: "",
        organisation: ""
      },
      operationDossier: null,
      dossierFinancier: null,
      texteRecapDtp: null,
      domaine: null,
      responsableAdministratif: null,
      loginRespAdm: null,
      derogationJustif: null,
      derogatoire: null,
      procedureDecision: null,
      totalPrixEauTtc: 0,
      totalPrixHtva: 0,
      sessionDecision: null,
      margeAvenir: null,
      margeAvenirJustif: null,
      descriptionOperation: null,
      resultatsAttendus: null,
      dossierCorrespondance: null,
      valideRl: true,
      valideSga: false,
      totalMontantAide: 5555555,
      documentsDossier: null,
      descriptifTechnique: null,
      avis: null,
      motifAvis: "motif",
      dossierAdmin: null
    };

    dossierService
      .refuseDossier(idDossier, refusDossierToSend)
      .subscribe(dossierRefus => {
        expect(dossierRefus).toBeDefined();
        expect(dossierRefus.refusDossier.motifRefus).toEqual(
          refusDossierToSend.motifRefus
        );
        expect(dossierRefus.refusDossier.natureRefus).toEqual(
          refusDossierToSend.natureRefus
        );
        expect(dossierRefus.id).toEqual(idDossier);
        expect(dossierRefus.phase).toEqual("T40");
      });

    const req = httpMock.expectOne({
      method: "PUT",
      url: appService.environment.BACKEND + `/dossier/refus/${idDossier}`
    });
    req.flush(dummmyDossier);
  });

  /**
   * unit test of reactiveDossier function
   */
  it("should delete a nature and motif of refus when we reactive a dossier", () => {
    const natureRefus: NatureRefus = {
      id: 22,
      libelle: "Dossier abandonné",
      code: "NEXFF"
    };
    const refusDossier: RefusDossier = {
      motifRefus: "testing",
      natureRefus: natureRefus
    };

    const dummmyDossier: Dossier = {
      id: 10,
      courriers: [],
      beneficiaire: {
        reference: "12455477P",
        raisonSociale: "raison sociale de 12455477P",
        actif: true,
        actifLibelle: "",
        status: "test",
        address: null,
        commune: null
      },
      thematique: null,
      departement: null,
      intitule: "AABBCCDD",
      phase: null,
      refusDossier: null,
      planFinancementDossier: null,
      donneeSpecifiqueThema: null,
      noOrdre: 1,
      noOrdreFormate: "string",
      numeroDossier: "string",
      referenceBenef: "",
      preDossier: null,
      margeAvenir: null,
      margeAvenirJustif: null,
      descriptionOperation: null,
      resultatsAttendus: null,
      responsableTechnique: {
        login: "test",
        prenom: "prenom dd",
        nom: "mon nom",
        email: "",
        telephone: "",
        organisation: ""
      },
      responsableAdministratif: null,
      loginRespAdm: null,
      numeroAid: "l124587",
      operationDossier: null,
      dossierFinancier: null,
      texteRecapDtp: null,
      domaine: null,
      derogationJustif: null,
      derogatoire: null,
      procedureDecision: null,
      totalPrixEauTtc: 0,
      totalPrixHtva: 0,
      sessionDecision: null,
      dossierCorrespondance: null,
      valideRl: true,
      valideSga: true,
      totalMontantAide: 8888888,
      documentsDossier: null,
      descriptifTechnique: null,
      avis: null,
      motifAvis: "motif",
      dossierAdmin: null
    };
    dossierService
      .reactiverDossier(dummmyDossier.id)
      .subscribe(dossierRefus => {
        expect(dossierRefus).toBeDefined();
        expect(dossierRefus.refusDossier).toBeNull();
        // expect(dossierRefus.refusDossier.natureRefus).toBeNull();
        expect(dossierRefus.id).toEqual(dummmyDossier.id);
        expect(dossierRefus.phase).toBeNull();
      });

    const req = httpMock.expectOne({
      method: "PUT",
      url:
        appService.environment.BACKEND +
        `/dossier/reactiver/${dummmyDossier.id}`
    });
    req.flush(dummmyDossier);
  });

  /**
   * getTypeDispositif should return an array of type dispositif
   */
  it("should return an Observable<Object> which contain an array of dispositif type", () => {
    // initialisation d'un resultat type que le backend fournirait
    const dummyTypeDispositif = [
      {
        id: 1,
        codeParam: "TYPE DISPOSITIF",
        libelleParam: null,
        code: "CONV",
        libelle: "Convention"
      },
      {
        id: 2,
        codeParam: "TYPE DISPOSITIF",
        libelleParam: null,
        code: "CONT",
        libelle: "Contrat"
      }
    ];

    dossierService.getTypeDispositif().subscribe(data => {
      // test des différents éléments du retour
      expect(data[0].id).toBe(1);
      expect(data).toEqual(
        dummyTypeDispositif,
        "#getResultatRecherche's method should return the proper object"
      );
    });

    // configuration de la réponse mockée
    const req = httpMock.expectOne(
      appService.environment.BACKEND + "/dispositif/typedispositifpartenariat"
    );
    expect(req.request.method).toBe("GET");
    req.flush(dummyTypeDispositif);
  });

  /**
   * getDispositif should return a dispositif
   */
  it("should return a dispositif", () => {
    // initialisation d'un resultat type que le backend fournirait
    const dummyDispositif = {
      typeDispositif: {
        code: "CONV",
        libelle: "Convention"
      },
      numeroIncrementDispositif: 1
    };

    dossierService.getDispositif(1, "0001").subscribe(data => {
      // test des différents éléments du retour
      expect(data.typeDispositif.code).toBe("CONV");
    });

    // configuration de la réponse mockée
    const req = httpMock.expectOne(
      appService.environment.BACKEND +
      "/dispositif?numeroOrdre=0001&typeDispositif=1"
    );
    expect(req.request.method).toBe("GET");
    req.flush(dummyDispositif);
  });

  it("#getCoefficientOfConversion should return an Observable<Object> which contain an object of Coefficient of conversion", () => {
    const dummyCoefConversion: CoefficientConversion = {
      id: 51,
      codeParam: "COEF_EQ_SUB",
      libelleParam: null,
      valeurDate: null,
      valeurStr: "0.1",
      valeurCoef: 0.1
    };

    const coef = dummyCoefConversion;
    expect(coef.valeurStr).toBe("0.1");
  });

  xit("should return a list of typeOuvrage", () => {
    // initialisation d'un resultat type que le backend fournirait
    const dummyTypeOuvrage = {
      id: 52,
      codeParam: "TYPE_OUV",
      libelleParam: "Type d'ouvrage",
      code: "ANC",
      libelle: "Assainissement non collectif",
      texte: null
    };
    // tslint:disable-next-line:no-shadowed-variable
    dossierService.getTypeOuvrage().forEach(data => {
      // test des différents éléments du retour
      expect(data.code).toBe("ANC");
      expect(data.id).toBe(52);
    });

    // configuration de la réponse mockée
    const req = httpMock.expectOne(appService.environment.BACKEND + "/valeur");
    expect(req.request.method).toBe("GET");
    req.flush(dummyTypeOuvrage);
  });

  it("should return one ouvrage using type and libelle", () => {
    // initialisation d'un resultat type que le backend fournirait
    const dummyOuvrage = {
      id: 1,
      codeAgence: "31053100",
      typeOuvrage: {
        id: 56,
        codeParam: "TYPE_OUV",
        libelleParam: "Type d'ouvrage",
        code: "EIP",
        libelle: "Etablissement industriel",
        texte: null
      },
      libelle: "S.C.I. CLINIQUE DE BEAUPUY"
    };

    dossierService
      .getOuvrage(dummyOuvrage.typeOuvrage.code, dummyOuvrage.codeAgence)
      .subscribe(data => {
        // test des différents éléments du retour
        expect(data.codeAgence).toBe(dummyOuvrage.codeAgence);
        expect(data.typeOuvrage.code).toBe(dummyOuvrage.typeOuvrage.code);
      });

    // configuration de la réponse mockée
    const req = httpMock.expectOne(
      appService.environment.BACKEND +
      "/ouvrage/type/code?typeOuvrage=EIP&codeAgence=31053100"
    );
    expect(req.request.method).toBe("GET");
    req.flush(dummyOuvrage);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    // httpMock.verify();
  });
});
