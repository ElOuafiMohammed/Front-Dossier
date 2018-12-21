import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { AppService } from "app/app.service";
import { GlobalState } from "app/global.state";
import { Delegation } from "app/pages/dossiers/validate-dossier/validate-dossier.interface";
import MethodeGenerique from "app/shared/methodes-generiques";
import { Observable, Subject, Subscription } from "rxjs";

import {
  ActionPrio,
  Beneficiaire,
  DossierCreate,
  Enjeu,
  Ligne,
  Pays,
  Phase,
  ResponsableTechnique,
  Thematique,
  TypeAction,
  TypeDocument,
  ZonePrio,
} from './create-dossier/create-dossier.interface';
import { Courrier, CourrierFields, ModeleGCD } from './dossier/courriers/courrier.interface';
import {
  Avis,
  BvGestion,
  CoefficientConversion,
  Communes,
  DelaiFinValidite,
  DispositionsFinancieres,
  Domaine,
  DossierAction,
  EncadrementCommJustif,
  EngagementsParticuliers,
  FormDocAttrib,
  LastDateAttribution,
  Lignes,
  ModalitesReduction,
  ModalitesVersement,
  NatureOperation,
  NiveauPriorite,
  Operation,
  OrigineDemande,
  ProcedureDecision,
  QualiteContact,
  Regions,
  RoleCorrespondant,
  SessionDecision,
  SldNonStandard,
  Theme,
  TypeDispositif,
  TypeDocAttrib,
  Typologie,
} from './dossier/dossier.interface';
import { EnumCodeApplicationParam, EnumListValeur } from './dossier/enumeration/enumerations';
import {
  CritereSearchOuvrage,
  EtatOuvrage
} from "./dossier/nature-operation/ouvrage/search-popup-ouvrage/search-popup-ouvrage.interface";
import {
  Ouvrage,
  TypeOuvrage
} from "./dossier/nature-operation/ouvrage/tableau-dynamique-ouvrage/tableau-dynamique-ouvrage.interface";
import { PieceJointe } from "./dossier/pieces-jointes/pieces-jointes.interface";
import { Financeur } from "./dossier/plan-financement/tableau-dynam-cofinancements/tableau-dynam-cofinancements-interface";
import { Libelle } from "./dossier/previsionnel/tableau-dynam-prev/tableau-dynam-prev-interface";
import {
  ApplicationParam,
  AvisDossier,
  Commune,
  CritereSearchBeneficiaire,
  Departements,
  DescriptifTechnique,
  Dispositif,
  Dossier,
  DossierFinancier,
  ListValeur,
  PreDossier
} from "./dossiers.interface";
import { DossierPrevGestion } from "./gerer-prevesionnel-dossier/gerer-previsionnelle.component.interface";
import { Critere } from "./recherche-dossier/recherche-dossier.interface";
import { CritereRemarque } from 'app/pages/dossiers/recherche-dossier/recherche-dossier.interface';
import {
  NatureRefus,
  RefusDossier
} from "./refuse-dossier-popup/refuse-dossier-popup.interface";

@Injectable()
export class DossierService {
  private _customHeaders: HttpHeaders = null;
  private _dossier: Dossier = null;
  private _preDossier: PreDossier = null;
  private _dossierFinancier: DossierFinancier = null;
  private _operations: Operation[] = null;
  private _dossierPhaseSubject: Subject<boolean>;
  private _dossierAdministratifSubject: Subject<boolean>;
  private _dossierSubject: Subject<boolean>;
  private _specificiteCalcul = "";
  private _descriptionOperation = "";
  private _resultatsAttendus = "";
  private _formCritere: FormGroup = null;
  private _formValidationCritere: FormGroup = null;
  private _formValidationCritereRlSga: FormGroup = null;
  private _formCommisonAffectation: FormGroup = null;
  private _formResultatRecherche: FormGroup = null;
  private _formSignerVerifier: FormGroup = null;
  private _formPrevGestion: FormGroup = null;
  private _formAttribuerAides: FormGroup = null;
  // store ids of checked dossiers in results of search delegue
  public idsCheckedDossier: Array<number> = [];
  // store value of checkbox 'Tout' that can be found in page of search delegue
  public checkAll = null;
  public delay = 1000;
  public currentPage = "";
  public previousPage = "";
  tempDossierURL = "/assets/mock/dossier.json";
  tempThematiquesURL = "/assets/mock/thematiques.json";
  tempDeptsURL = "/assets/mock/depts.json";
  tempNaturesURL = "/assets/mock/natureRefus.json";
  tempModalitesReductionAidesURL = "/assets/mock/modalitesReduction.json";
  tempModalitesVersementAidesURL = "/assets/mock/modalitesVersement.json";
  public listValeur: Observable<ListValeur[]>;
  public dossierPhase$: Observable<boolean>;
  public dossierAdministratif$: Observable<boolean>;
  public dossier$: Observable<boolean>;

  private _ouvrage: Ouvrage = null;
  public _ouvrageSubject: Subject<any>;
  public ouvrageData$: Observable<any>;
  public dispositifData$: Observable<any>;
  public _dispositifSubject: Subject<any>;
  public listValeurs: ListValeur[] = [];
  public applicationInfo: ApplicationParam[];
  public listLignes: Ligne[] = [];
  public listSessionsDecision: SessionDecision[] = [];
  public _localisationPertinente: Subject<boolean>;
  public _travauxOuvrage: Subject<boolean>;
  public _caracteristiqueOuvrage: Subject<any> = new Subject<any>();
  public url: any;

  /**
   * Data Shared ouvrage
   */
  elementDataOuvrage: Ouvrage[] = [];

  constructor(
    private _httpClient: HttpClient,
    private _appService: AppService,
    private _state: GlobalState
  ) {
    this.url = `${this._appService.environment.BACKEND}/valeur`;
    // Initialize phase subject
    this._dossierPhaseSubject = new Subject<boolean>();
    this.dossierPhase$ = this._dossierPhaseSubject.asObservable();

    this._dossierAdministratifSubject = new Subject<boolean>();
    this.dossierAdministratif$ = this._dossierAdministratifSubject.asObservable();

    // Initialize dossier subject
    this._dossierSubject = new Subject<boolean>();
    this.dossier$ = this._dossierSubject.asObservable();

    this._ouvrageSubject = new Subject<boolean>();
    this.ouvrageData$ = this._ouvrageSubject.asObservable();
    this._dispositifSubject = new Subject<boolean>();
    this.dispositifData$ = this._dispositifSubject.asObservable();

    // Initialize localisation pertinente subject
    this._localisationPertinente = new Subject<boolean>();

    // Initialisation travaux sur ouvrage
    this._travauxOuvrage = new Subject<boolean>();

    // SIGA-3634 : suppression setCustomHeaders
    // this.setCustomHeaders();
    this.getListValeur();
    this.getLignesInit();
    this.getSessionDecisionInit();
    this.getApplicationInfo();
  }

  getUrlDispositifFront(idDispositif: number) {
    return `${
      this._appService.environment.FRONT_DISPOSITIF
      }/dispositif/${idDispositif}`;
  }

  getCommuneBeneficiaire(departement: string): Observable<Commune[]> {
    const url = `${
      this._appService.environment.BACKEND
      }/departement/${departement}/communes`;
    return this._httpClient.get<Commune[]>(url, {
      headers: this._customHeaders
    });
  }

  // SIGA-3634 : suppression setCustomHeaders
  // /**
  //  * Correction bug IE pour les méthodes GET sur même domaine
  //  */
  // setCustomHeaders() {
  //   this._customHeaders = new HttpHeaders({
  //     "Cache-Control": "no-cache",
  //     Pragma: "no-cache",
  //     Expires: "Sat, 01 Jan 2000 00:00:00 GMT"
  //   });
  // }

  /**
   * The whole dossier object currently used
   */
  get dossier() {
    return this._dossier;
  }
  set dossier(value: Dossier) {
    this._dossier = value;
    this._dossierSubject.next(true);

    /**
     * Propagate change to GlobalState to display on Breadcrumb
     * TODO : Improve ?
     */
    this._state.dossier = value;

    /**
     * Improve when dossier needs to be reactivated ?
     */
    this.isPhaseT40();
    this.isDossierAdministrartif();

    // Resets the data stored once updated
    this._preDossier = null;
  }

  /**
   * Stores the preDossier before being saved
   */
  get preDossier() {
    return this._preDossier;
  }
  set preDossier(value: PreDossier) {
    this._preDossier = value;
  }

  /**
   * Stores the preDossier before being saved
   */
  get dossierFinancier() {
    return this._dossierFinancier;
  }
  set dossierFinancier(value: DossierFinancier) {
    this._dossierFinancier = value;
  }

  /**
   * Stores the preDossier before being saved
   * TODO - Improve : Incorrect JS DOC
   */
  get specificiteCalcul() {
    return this._specificiteCalcul;
  }
  get descriptionOperation() {
    return this._descriptionOperation;
  }
  get resultatsAttendus() {
    return this._resultatsAttendus;
  }
  // TODO - Improve : Incorrect Type
  set specificiteCalcul(value: string) {
    this._specificiteCalcul = value;
  }
  set descriptionOperation(value: string) {
    this._descriptionOperation = value;
  }
  set resultatsAttendus(value: string) {
    this._resultatsAttendus = value;
  }

  /**
   * Stores the formRechercheCritere before being saved
   */
  get formCritere() {
    return this._formCritere;
  }
  set formCritere(value: FormGroup) {
    this._formCritere = value;
  }

  /**
   * Stores the formValidationRechercheCritere before being saved
   */
  get formValidationCritere() {
    return this._formValidationCritere;
  }
  set formValidationCritere(value: FormGroup) {
    this._formValidationCritere = value;
  }
  /**
  * Stores the formValidationRechercheCritere before being saved
  */
  get formSignerVerifier() {
    return this._formSignerVerifier;
  }
  set formSignerVerifier(value: FormGroup) {
    this._formSignerVerifier = value;
  }

  /**
   * Stores the formValidationRechercheCritere before being saved
   */
  get formValidationCritereRlSga() {
    return this._formValidationCritereRlSga;
  }
  set formValidationCritereRlSga(value: FormGroup) {
    this._formValidationCritereRlSga = value;
  }

  /**
   * Stores the formValidationRechercheCritere before being saved
   */
  get formCommisonAffectation() {
    return this._formCommisonAffectation;
  }
  set formCommisonAffectation(value: FormGroup) {
    this._formCommisonAffectation = value;
  }

  get formResultatRecherche() {
    return this._formResultatRecherche;
  }

  set formResultatRecherche(value: FormGroup) {
    this._formResultatRecherche = value;
  }

  get formPrevGestion() {
    return this._formPrevGestion;
  }

  set formPrevGestion(value: FormGroup) {
    this._formPrevGestion = value;
  }
  get formAttribuerAides() {
    return this._formAttribuerAides;
  }

  set formAttribuerAides(_formAttribuerAides: FormGroup) {
    this._formAttribuerAides = _formAttribuerAides;
  }

  sortListValeurByCode(a: ListValeur, b: ListValeur): number {
    if (a.code < b.code) {
      return -1;
    }
    if (a.code > b.code) {
      return 1;
    }
    return 0;
  }

  sortListValeurByLibelle(a: ListValeur, b: ListValeur): number {
    if (a.libelle < b.libelle) {
      return -1;
    }
    if (a.libelle > b.libelle) {
      return 1;
    }
    return 0;
  }

  sortListValeurByNoOrdre(a: ListValeur, b: ListValeur): number {
    if (a.noOrdre < b.noOrdre) {
      return -1;
    }
    if (a.noOrdre > b.noOrdre) {
      return 1;
    }
    return 0;
  }

  getListValeur(): ListValeur[] {
    this._httpClient
      .get<ListValeur[]>(this.url, { headers: this._customHeaders })
      .subscribe(list => {
        this.listValeurs = list;
        window.localStorage.setItem("globalListValeurs", JSON.stringify(list));
        this.delay = 0;
      });
    return this.listValeurs;
  }

  getApplicationInfo(): ApplicationParam[] {
    const url = `${this._appService.environment.BACKEND}/application`;
    this._httpClient
      .get<ApplicationParam[]>(url, { headers: this._customHeaders })
      .subscribe(list => {
        this.applicationInfo = list;
        this.delay = 0;
      });
    return this.applicationInfo;
  }

  getRoleCorrspondant(): RoleCorrespondant[] {
    return this.getListValeurByCodeParam(EnumListValeur.ROLE_CORRESP).sort(
      this.sortListValeurByLibelle
    );
  }

  getQualiteContact(): QualiteContact[] {
    return this.getListValeurByCodeParam(EnumListValeur.QUALITE_CONTACT).sort(
      this.sortListValeurByLibelle
    );
  }

  getApplicationByCodeParam(codePram: string): ApplicationParam {
    let retour = null;
    const list = this.applicationInfo.filter(
      value => value.codeParam === codePram
    );
    if (list) {
      retour = list[0];
    }
    return retour;
  }

  getListValeurByCodeParam(codeParam: EnumListValeur): ListValeur[] {
    // if (this.listValeurs == null || this.listValeurs.length === 0) {
    //   setTimeout(() => {
    //     this.listValeurs = this.getListValeur();
    //   }, 50);
    // }
    const listDesValeurs = JSON.parse(
      window.localStorage.getItem("globalListValeurs")
    );
    if (listDesValeurs) {
      return listDesValeurs.filter(value => value.codeParam === codeParam);
    }
    return null;
  }

  getvaleursImpactListe(codeListe): any[] {
    return this.getListValeurByCodeParam(codeListe).sort(
      this.sortListValeurByCode
    );
  }

  getThematiques(): Thematique[] {
    return this.getListValeurByCodeParam(EnumListValeur.THEMA).sort(
      this.sortListValeurByCode
    );
  }

  getListOfListValeurs(): ListValeur[] {
    return this.getListValeurByCodeParam(EnumListValeur.LIST_PARAM).sort(
      this.sortListValeurByCode
    );
  }

  getDelaiFinValidite(): DelaiFinValidite {
    return this.getApplicationByCodeParam(
      EnumCodeApplicationParam.DELAI_FIN_VALID
    );
  }

  createDossier(dossier: DossierCreate) {
    const url = `${this._appService.environment.BACKEND}/dossier`;
    return this._httpClient.post<Dossier>(url, dossier);
  }

  /**
   * Create a list of documents associete to dossier
   *
   * @param idDossier : id of dossier
   * @param documents : docments to attache
   */
  createPieceJointe(documents: PieceJointe[], idDossier: number) {
    const url = `${this._appService.environment.BACKEND}/document/${idDossier}`;
    return this._httpClient.post<PieceJointe[]>(url, documents);
  }

  /**
   * Delete a document by code
   * @param codeDoc : code document
   */
  deletePieceJointe(codeDoc: string) {
    const url = `${this._appService.environment.BACKEND}/document/${codeDoc}`;
    return this._httpClient.delete<string>(url);
  }

  /**
   * create an empty file : descriptif technique
   * @param idDossier : id of dossier
   */
  createDescriptifTech(idDossier: number) {
    const url = `${
      this._appService.environment.BACKEND
      }/document/descriptif/${idDossier}`;
    return this._httpClient.post<PieceJointe>(url, document);
  }

  readDescriptifTech(codeDoc: string) {
    const url = `${
      this._appService.environment.BACKEND
      }/document/descriptif/urlOffice/${codeDoc}`;
    return this._httpClient.get<DescriptifTechnique>(url, {
      headers: this._customHeaders
    });
  }

  getDescriptifTechnique(codeDoc: string) {
    const url = `${
      this._appService.environment.BACKEND
      }/document/descriptif/${codeDoc}`;
    return this._httpClient.get<DescriptifTechnique>(url, {
      headers: this._customHeaders
    });
  }

  getSessionPrevisionnel() {
    const url = `${
      this._appService.environment.BACKEND
      }/valeur/sessionDecision/previsionnel`;
    return this._httpClient.get<SessionDecision[]>(url, {
      headers: this._customHeaders
    });
  }

  getCourriers(idDossier: number): Observable<Courrier[]> {
    const url = `${
      this._appService.environment.BACKEND
      }/courrier?idDossier=${idDossier}`;
    return this._httpClient.get<Courrier[]>(url, {
      headers: this._customHeaders
    });
  }

  postCourrier(
    courrier: CourrierFields,
    idDossier: number
  ): Observable<Courrier> {
    const url = `${this._appService.environment.BACKEND}/courrier/${idDossier}`;
    return this._httpClient.post<Courrier>(url, courrier, {
      headers: this._customHeaders
    });
  }

  getLignesInit(): Ligne[] {
    const url = `${this._appService.environment.BACKEND}/valeur/ligne`;
    this._httpClient
      .get<Ligne[]>(url, { headers: this._customHeaders })
      .subscribe(list => {
        this.listLignes = list;
        this.delay = 0;
      });
    return this.listLignes;
  }

  getLignes(): Ligne[] {
    return this.listLignes;
  }

  getSessionDecisionInit(): SessionDecision[] {
    const url = `${
      this._appService.environment.BACKEND
      }/valeur/sessionDecision`;
    this._httpClient
      .get<SessionDecision[]>(url, { headers: this._customHeaders })
      .subscribe(list => {
        this.listSessionsDecision = list;
        this.delay = 0;
      });
    return this.listSessionsDecision;
  }

  getDateAttributifs(): Observable<Date[]> {
    const url = `${this._appService.environment.BACKEND}/dossier/dateAttribution`;
    return this._httpClient.get<Date[]>(url, { headers: this._customHeaders });
  }
  getSessionsDecision(): SessionDecision[] {
    return this.listSessionsDecision;
  }

  getSessionsDecisionPrevisionnel(): SessionDecision[] {
    return this.listSessionsDecision;
  }
  getDepts(): Observable<Departements[]> {
    const tempLocalAssets = "/assets/mock/depts.json";
    return this._httpClient.get<Departements[]>(`${tempLocalAssets}`);
  }

  getResponsableTech(): Observable<ResponsableTechnique[]> {
    const url = `${this._appService.environment.BACKEND}/utilisateur`;
    return this._httpClient.get<ResponsableTechnique[]>(url, {
      headers: this._customHeaders
    });
  }

  getNatureRefus(): NatureRefus[] {
    return this.getListValeurByCodeParam(EnumListValeur.NATREF).sort(
      this.sortListValeurByLibelle
    );
  }

  getOrigineDemande(): OrigineDemande[] {
    return this.getListValeurByCodeParam(EnumListValeur.ORIDDE).sort(
      this.sortListValeurByCode
    );
  }

  getAvis(): Avis[] {
    return this.getListValeurByCodeParam(EnumListValeur.AVIS).sort(
      this.sortListValeurByCode
    );
  }

  getLinesOfThematique(code: string): Observable<Libelle[]> {
    const url = `${
      this._appService.environment.BACKEND
      }/valeur/ligne/thematique?codeThematique=${code}`;
    return this._httpClient.get<Libelle[]>(url, {
      headers: this._customHeaders
    });
  }

  getLinesOfFinanceurs(): Observable<Financeur[]> {
    const url = `${this._appService.environment.BACKEND}/valeur/financeur`;
    return this._httpClient.get<Financeur[]>(url, {
      headers: this._customHeaders
    });
  }

  getCoefficientOfConversion(): CoefficientConversion {
    const coefParam = this.getApplicationByCodeParam(
      EnumCodeApplicationParam.COEF_EQ_SUB
    ) as CoefficientConversion;
    if (coefParam) {
      coefParam.valeurCoef = parseFloat(coefParam.valeurStr);
    }

    return coefParam;
  }

  getTheme(): Theme[] {
    return this.getListValeurByCodeParam(EnumListValeur.THEME).sort(
      this.sortListValeurByLibelle
    );
  }

  getDispositionFinanciere(): DispositionsFinancieres[] {
    return this.getListValeurByCodeParam(EnumListValeur.DISPO_FINAN).sort(
      this.sortListValeurByCode
    );
  }

  getSoldesNonStandard(): SldNonStandard[] {
    return this.getSoldesNonStandard();
  }

  getModalitesReductionAides(): ModalitesReduction[] {
    return this.getListValeurByCodeParam(EnumListValeur.MODA_REDUC).sort(
      this.sortListValeurByLibelle
    );
  }

  getModalitesVersementAides(): ModalitesVersement[] {
    return this.getListValeurByCodeParam(EnumListValeur.MODA_VERS).sort(
      this.sortListValeurByLibelle
    );
  }

  getEngagementParticulier(): EngagementsParticuliers[] {
    return this.getListValeurByCodeParam(EnumListValeur.ENGA_PART).sort(
      this.sortListValeurByCode
    );
  }

  getEncadrementCommJustif(): EncadrementCommJustif[] {
    return this.getListValeurByCodeParam(EnumListValeur.ENCAD_JUSTIF).sort(
      this.sortListValeurByLibelle
    );
  }
  getDomaines(): Domaine[] {
    return this.getListValeurByCodeParam(EnumListValeur.DOMAINE).sort(
      this.sortListValeurByLibelle
    );
  }

  getTypologies(): Typologie[] {
    return this.getListValeurByCodeParam(EnumListValeur.TYPOLOGIE).sort(
      this.sortListValeurByLibelle
    );
  }

  getformDocAttrib(): FormDocAttrib[] {
    return this.getListValeurByCodeParam(EnumListValeur.FORM_DOC_ATTRIB).sort(
      this.sortListValeurByLibelle
    );
  }

  getTypDocAttrib(): TypeDocAttrib[] {
    return this.getListValeurByCodeParam(EnumListValeur.TYP_DOC_ATTRIB);
  }

  getProcedureDecisions(): ProcedureDecision[] {
    return this.getListValeurByCodeParam(EnumListValeur.PROC_DECI).sort(
      this.sortListValeurByCode
    );
  }

  getDelegation(): Delegation[] {
    return this.getListValeurByCodeParam(EnumListValeur.DELEGATION).sort(
      this.sortListValeurByLibelle
    );
  }

  getDossier(idDossier: number) {
    const url = `${this._appService.environment.BACKEND}/dossier/${idDossier}`;
    return this._httpClient.get<Dossier>(url, { headers: this._customHeaders });
  }

  getPhases(): Phase[] {
    return this.getListValeurByCodeParam(EnumListValeur.PHASE).sort(
      this.sortListValeurByNoOrdre
    );
  }

  getEnjeu(): Enjeu[] {
    return this.getListValeurByCodeParam(EnumListValeur.ENJEU).sort(
      this.sortListValeurByNoOrdre
    );
  }

  getPays(): Pays[] {
    return this.getListValeurByCodeParam(EnumListValeur.PAYS).sort(
      this.sortListValeurByNoOrdre
    );
  }

  getZonePrio(): ZonePrio[] {
    return this.getListValeurByCodeParam(EnumListValeur.ZONE_PRIO).sort(
      this.sortListValeurByNoOrdre
    );
  }

  getTypeDoc(): TypeDocument[] {
    return this.getListValeurByCodeParam(EnumListValeur.TYPE_DOC).sort(
      this.sortListValeurByNoOrdre
    );
  }

  getActionPrio(): ActionPrio[] {
    return this.getListValeurByCodeParam(EnumListValeur.ACTION_PRIO).sort(
      this.sortListValeurByNoOrdre
    );
  }

  getTypeActions(): TypeAction[] {
    return this.getListValeurByCodeParam(EnumListValeur.TYPE_ACTION).sort(
      this.sortListValeurByNoOrdre
    );
  }

  getDepartements(): Observable<Departements[]> {
    const url = `${this._appService.environment.BACKEND}/departement`;
    return this._httpClient.get<Departements[]>(url, {
      headers: this._customHeaders
    });
  }

  getCommunes(departements: Departements[]): Observable<Communes[]> {
    let numeroDepartements: string = departements[0].numero;
    for (let index = 1; index < departements.length; index++) {
      numeroDepartements = `${numeroDepartements},${
        departements[index].numero
        }`;
    }
    const url = `${
      this._appService.environment.BACKEND
      }/departement/${numeroDepartements}/communes`;
    return this._httpClient.get<any[]>(url, { headers: this._customHeaders });
  }

  getModeles(): Observable<ModeleGCD[]> {
    const url = `${this._appService.environment.BACKEND}/modele`;
    return this._httpClient.get<ModeleGCD[]>(url, {
      headers: this._customHeaders
    });
  }

  getLastDateOfAttribution(): LastDateAttribution {
    return this.getApplicationByCodeParam(EnumCodeApplicationParam.DATE_ATTRIB);
  }

  updateDossier(dossier: Dossier): Observable<Dossier> {
    const url = `${this._appService.environment.BACKEND}/dossier`;
    return this._httpClient.put<Dossier>(url, dossier, {
      headers: this._customHeaders
    });
  }

  saveAvis(avis: AvisDossier[]): Observable<any> {
    const url = `${this._appService.environment.BACKEND}/dossier/dossierAvis`;
    return this._httpClient.post<Dossier>(url, avis, {
      headers: this._customHeaders
    });
  }
  saveGestionPrev(dossiersPrev: DossierPrevGestion[]): Observable<any> {
    const url = `${
      this._appService.environment.BACKEND
      }/dossier/dossierPrevisionnel`;
    return this._httpClient.post<Dossier>(url, dossiersPrev, {
      headers: this._customHeaders
    });
  }

  refuseDossier(
    idDossier: number,
    refusDossier: RefusDossier
  ): Observable<Dossier> {
    const url = `${
      this._appService.environment.BACKEND
      }/dossier/refus/${idDossier}`;
    return this._httpClient.put<Dossier>(url, refusDossier);
  }

  reactiverDossier(idDossier: number): Observable<Dossier> {
    const url = `${
      this._appService.environment.BACKEND
      }/dossier/reactiver/${idDossier}`;
    return this._httpClient.put<Dossier>(url, {});
  }

  basculer(idDossier: number): Observable<Dossier> {
    const url = `${
      this._appService.environment.BACKEND
      }/dossier/basculer/${idDossier}`;
    return this._httpClient.put<Dossier>(url, {});
  }

  valider(idDossier: number): Observable<Dossier> {
    const url = `${
      this._appService.environment.BACKEND
      }/dossier/valider/rt/${idDossier}`;
    return this._httpClient.put<Dossier>(url, {});
  }

  devalider(idDossier: number): Observable<Dossier> {
    const url = `${
      this._appService.environment.BACKEND
      }/dossier/devalider/rt/${idDossier}`;
    return this._httpClient.put<Dossier>(url, {});
  }

  /**
   * Generic service for basculer - valider - devalider actions
   */
  bascValidDevalid(dossierAction: DossierAction): Observable<DossierAction> {
    const url = `${this._appService.environment.BACKEND}/dossier/action`;
    return this._httpClient.post<DossierAction>(url, dossierAction, {
      headers: this._customHeaders
    });
  }
  getResultatRechercheBeneficiaire(
    criteresSearchBeneficiaire: CritereSearchBeneficiaire
  ): Observable<any> {
    let requestUrl = "/interlocuteur";
    // nom
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "nom",
      encodeURIComponent(criteresSearchBeneficiaire.nom)
    );
    // departement
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "departement",
      criteresSearchBeneficiaire.departement.numero
    );
    // commune
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "commune",
      criteresSearchBeneficiaire.commune.numInsee
    );
    // siren
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "siren",
      criteresSearchBeneficiaire.siren
    );
    // nic
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "nic",
      criteresSearchBeneficiaire.nic
    );
    // Numéro agence
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "numeroAgence",
      criteresSearchBeneficiaire.numeroAgence
    );
    // booleen pour les bénéficiaires inactifs
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "inactif",
      criteresSearchBeneficiaire.inactif
    );
    // page à afficher
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "numeroPage",
      criteresSearchBeneficiaire.pageAAficher
    );
    // nombre élément par page
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "nombreElementPage",
      criteresSearchBeneficiaire.nbElemPerPage
    );
    return this._httpClient.get<Dossier>(
      `${this._appService.environment.BACKEND}${requestUrl}`,
      { headers: this._customHeaders }
    );
  }

  /**
   * Get the list of Dossiers depending on the different criterias
   * @param criteresRecherche criterias set in input
   */
  getResultatRecherche(criteresRecherche: Critere): Observable<any> {

    let requestUrl = '/dossier';
    // code thematique
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      'codeThematique',
      criteresRecherche.codeThematique
    );
    // date attribution
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      'dateAttribution',
      criteresRecherche.dateAttribution
    );
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "idThematique",
      criteresRecherche.thematique
    );
    // departement
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "departement",
      criteresRecherche.departement
    );
    // responsable technique
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "idResponsableTechnique",
      criteresRecherche.responsableTech
    );
    // responsable administratif
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      'loginResponsableAdm',
      criteresRecherche.loginResponsableAdm
    );
    // signer ou non
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      'isSigne',
      criteresRecherche.isSigne
    );
    // beneficiaire
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "numeroBeneficiaire",
      criteresRecherche.codeBenef
    );
    // phase
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "phase",
      criteresRecherche.phase
    );
    // listPhase
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "listPhase",
      criteresRecherche.listPhase
    );
    // numéro d'ordre
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "numeroOrdre",
      criteresRecherche.numeroIncrement
    );
    // priorite
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "idPriorite",
      criteresRecherche.priorite
    );
    // procedure de decision
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "idProcedureDecision",
      criteresRecherche.procedureDecision
    );
    // annneee
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "anneeEngagPrevi",
      criteresRecherche.annee
    );
    // service departement
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "codeServiceDept",
      criteresRecherche.codeServiceDept
    );
    // delegation
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "delegation",
      criteresRecherche.delegation
    );
    // domaine
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "domaine",
      criteresRecherche.domaine
    );
    // devaliderSiege
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "devaliderSiege",
      criteresRecherche.devaliderSiege
    );
    // nature operation
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "idNatureOperation",
      criteresRecherche.natureOperation
    );

    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "listIdNatureOperation",
      criteresRecherche.listNatureOperation
    );
    // session decision
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "idSessionDecision",
      criteresRecherche.session
    );
    // session decision previsionnelle
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "idSessionDecisionPrevi",
      criteresRecherche.sessionPrev
    );
    // remarque sans reponse
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "hasReponseNontraite",
      criteresRecherche.hasReponseNontraite
    );
    // page à afficher
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "numeroPage",
      criteresRecherche.pageAAficher
    );
    // nombre élément par page
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "nombreElementPage",
      criteresRecherche.nbElemPerPage
    );

    return this._httpClient.get<Dossier>(
      `${this._appService.environment.BACKEND}${requestUrl}`,
      { headers: this._customHeaders }
    );
  }


  /**
* Research dossier about notes (remarque)
* @param criteresRecherche 
*/
  getResultsResearchRemark(criteresRecherche: CritereRemarque): Observable<any> {
    let requestUrl = '/dossier/remarque';
    //Destinateire
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(requestUrl, 'loginDestinataire', criteresRecherche.loginDestinataire);
    // Emetteur
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(requestUrl, 'loginEmetteur', criteresRecherche.loginEmetteur);
    // Repondu 
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(requestUrl, 'repondu', criteresRecherche.repondu);
    // archivé ou pas
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(requestUrl, 'archive', criteresRecherche.archive);

    return this._httpClient.get<Dossier>(`${this._appService.environment.BACKEND}${requestUrl}`, { headers: this._customHeaders });

  }

  /**
  * Research dossier about notes (remarque)
  * @param criteresRecherche 
  */
  updateDossierLu(criteresRecherche: CritereRemarque): Observable<any> {
    const url = `${this._appService.environment.BACKEND}/dossier/remarque`;
    return this._httpClient.put<Dossier>(url, criteresRecherche, {
      headers: this._customHeaders
    });
  }

  getBeneficaire(reference: string): Observable<Beneficiaire> {
    const url = `${
      this._appService.environment.BACKEND
      }/interlocuteur/${reference}`;
    return this._httpClient.get<Beneficiaire>(url, {
      headers: this._customHeaders
    });
  }

  getNiveauPriorite(): NiveauPriorite[] {
    return this.getListValeurByCodeParam(EnumListValeur.NIVPRIO).sort(
      this.sortListValeurByLibelle
    );
  }

  getSessionDecision(): Observable<SessionDecision[]> {
    const url = `${
      this._appService.environment.BACKEND
      }/valeur/sessionDecision`;
    return this._httpClient.get<SessionDecision[]>(url, {
      headers: this._customHeaders
    });
  }

  getTypeDispositif(): Observable<TypeDispositif[]> {
    const url = `${
      this._appService.environment.BACKEND
      }/dispositif/typedispositifpartenariat`;
    return this._httpClient.get<TypeDispositif[]>(url, {
      headers: this._customHeaders
    });
  }

  getDispositif(
    typeDispositif: number,
    numeroOrdre: string
  ): Observable<Dispositif> {
    const requestUrl = `/dispositif?numeroOrdre=${numeroOrdre}&typeDispositif=${typeDispositif}`;

    const url = `${this._appService.environment.BACKEND}${requestUrl}`;
    return this._httpClient.get<Dispositif>(url, {
      headers: this._customHeaders
    });
  }

  /**
   * Checks the phase of the current dossier
   */
  isPhaseT40(): void {
    if (this.dossier && this.dossier.phase === "T40") {
      return this._dossierPhaseSubject.next(true);
    }
    return this._dossierPhaseSubject.next(false);
  }

  /**
   * Checks the phase of the current dossier
   */
  isDossierAdministrartif(): void {
    if (this.dossier && this.dossier.statutPhase === "A") {
      return this._dossierAdministratifSubject.next(true);
    }
    return this._dossierAdministratifSubject.next(false);
  }

  updateListValeurs(listValeurs: ListValeur[]): Observable<ListValeur[]> {
    const url = `${this._appService.environment.BACKEND}/valeur`;
    return this._httpClient.put<ListValeur[]>(url, listValeurs, {
      headers: this._customHeaders
    });
  }

  updateNatureOperation(
    natureOperation: NatureOperation[]
  ): Observable<NatureOperation[]> {
    const url = `${
      this._appService.environment.BACKEND
      }/valeur/natureOperation`;
    return this._httpClient.put<NatureOperation[]>(url, natureOperation, {
      headers: this._customHeaders
    });
  }

  updateLignesInterv(lignes: Lignes[]): Observable<Lignes[]> {
    const url = `${this._appService.environment.BACKEND}/valeur/ligne`;
    return this._httpClient.put<Lignes[]>(url, lignes, {
      headers: this._customHeaders
    });
  }

  getLignesInterv(
    codeThematique: string,
    valide: boolean,
    nbElemPerPage: number,
    pageAAficher: number
  ): Observable<any> {
    let requestUrl = "/valeur/ligne/filtre";
    // codeThematique
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "codeThematique",
      codeThematique
    );
    // date de debut de validité
    // requestUrl = MethodeGenerique.buildApiUrlByCriteria(requestUrl, 'dateDebutValidite', dateDebutValidite);
    // date de fin de validité
    //  requestUrl = MethodeGenerique.buildApiUrlByCriteria(requestUrl, 'dateFinValidite', finValidite);
    // code
    //  requestUrl = MethodeGenerique.buildApiUrlByCriteria(requestUrl, 'numero', numero);
    // libelle
    //  requestUrl = MethodeGenerique.buildApiUrlByCriteria(requestUrl, 'libelle', libelle);
    // toDelete
    // requestUrl = MethodeGenerique.buildApiUrlByCriteria(requestUrl, 'toDelete', toDelete);
    // validete
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "valide",
      valide
    );
    // page à afficher
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "numeroPage",
      pageAAficher
    );
    // nombre élément par page
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "nombreElementPage",
      nbElemPerPage
    );
    return this._httpClient.get<Lignes[]>(
      `${this._appService.environment.BACKEND}${requestUrl}`,
      { headers: this._customHeaders }
    );
  }

  // getNaturesOperation(): Observable<NatureOperation[]> {
  //   const url = `${this._appService.environment.BACKEND}/valeur/natureOperation`;
  //   return this._httpClient.get<NatureOperation[]>(url, { headers: this._customHeaders });
  // }

  getNatureOperation(
    codeThematique: string,
    ligne: string,
    validete: boolean,
    nbElemPerPage: number,
    pageAAficher: number
  ): Observable<any> {
    let requestUrl = "/valeur/natureOperation/filtre";
    // codeThematique
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "codeThematique",
      codeThematique
    );
    // ligne
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "ligne",
      ligne
    );
    // validete
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "valide",
      validete
    );
    // page à afficher
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "numeroPage",
      pageAAficher
    );
    // nombre élément par page
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "nombreElementPage",
      nbElemPerPage
    );
    return this._httpClient.get<NatureOperation[]>(
      `${this._appService.environment.BACKEND}${requestUrl}`,
      { headers: this._customHeaders }
    );
  }

  searchListValeurs(
    codeThematique: string,
    codeListParam: string,
    valide: boolean,
    nbElemPerPage: number,
    pageAAficher: number
  ): Observable<any> {
    let requestUrl = "/valeur/recherche";
    // codeThematique
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "codeThematique",
      codeThematique
    );
    // ligne
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "codeListeParam",
      codeListParam
    );
    // validete
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "valide",
      valide
    );
    // page à afficher
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "numeroPage",
      pageAAficher
    );
    // nombre élément par page
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "nombreElementPage",
      nbElemPerPage
    );
    return this._httpClient.get<NatureOperation[]>(
      `${this._appService.environment.BACKEND}${requestUrl}`,
      { headers: this._customHeaders }
    );
  }

  searchLignes(
    codeThematique: string,
    valide: boolean,
    nbElemPerPage: number,
    pageAAficher: number
  ): Observable<any> {
    let requestUrl = "/valeur/ligne/filtre";
    // codeThematique
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "codeThematique",
      codeThematique
    );
    // ligne
    // requestUrl = MethodeGenerique.buildApiUrlByCriteria(requestUrl, 'codeListeParam', codeListParam);
    // validete
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "valide",
      valide
    );
    // page à afficher
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "numeroPage",
      pageAAficher
    );
    // nombre élément par page
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "nombreElementPage",
      nbElemPerPage
    );
    return this._httpClient.get<NatureOperation[]>(
      `${this._appService.environment.BACKEND}${requestUrl}`,
      { headers: this._customHeaders }
    );
  }

  // MAJ Sessions de Décision
  updateSessionDecision(
    sessionDecision: SessionDecision[]
  ): Observable<SessionDecision[]> {
    const url = `${
      this._appService.environment.BACKEND
      }/valeur/sessionDecision`;
    return this._httpClient.put<SessionDecision[]>(url, sessionDecision, {
      headers: this._customHeaders
    });
  }

  // api session decision avec filtre
  getSessionDecisionFiltre(
    type: string,
    annee: number,
    numero: number,
    nbElemPerPage: number,
    pageAAficher: number
  ): Observable<any> {
    let requestUrl = "/valeur/sessionDecision/filtre";
    // codeProcedure
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "codeProcedure",
      type
    );
    // anne
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "annee",
      annee
    );
    // numero
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "numero",
      numero
    );
    // page à afficher
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "numeroPage",
      pageAAficher
    );
    // nombre élément par page
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "nombreElementPage",
      nbElemPerPage
    );
    return this._httpClient.get<SessionDecision[]>(
      `${this._appService.environment.BACKEND}${requestUrl}`,
      { headers: this._customHeaders }
    );
  }

  getTypeOuvrage(): TypeOuvrage[] {
    return this.getListValeurByCodeParam(EnumListValeur.TYPE_OUV).sort(
      this.sortListValeurByLibelle
    );
  }

  getOuvrage(type: string, numero: string): Observable<Ouvrage> {
    const url = `${
      this._appService.environment.BACKEND
      }/ouvrage/type/code?typeOuvrage=${type}&codeAgence=${numero}`;
    return this._httpClient.get<Ouvrage>(url, { headers: this._customHeaders });
  }

  getMasseEau(code: string) {
    const url = `${this._appService.environment.BACKEND}/massedeau/${code}`;
    return this._httpClient.get<any>(url, { headers: this._customHeaders });
  }

  /**
   * Récupére la liste des Bv de gestion
   */
  getBvGestions(): Observable<BvGestion[]> {
    const url = `${this._appService.environment.BACKEND}/bvgestion`;
    return this._httpClient.get<BvGestion[]>(url, {
      headers: this._customHeaders
    });
  }

  /**
   * Récupère la liste des états d'ouvrage
   */
  getEtatOuvrage(): Observable<EtatOuvrage[]> {
    const url = `${this._appService.environment.BACKEND}/ouvrage/etats`;
    return this._httpClient.get<EtatOuvrage[]>(url, {
      headers: this._customHeaders
    });
  }

  /**
   * Récupére la liste des Bv de gestion
   */
  getRegions(): Observable<Regions[]> {
    const url = `${this._appService.environment.BACKEND}/region`;
    return this._httpClient.get<Regions[]>(url, {
      headers: this._customHeaders
    });
  }

  /**
   * search 'Ouvrage' with criteria
   * @param criteresRechercheOuvrage
   */
  getResultatRechercheOuvrage(
    criteresRechercheOuvrage: CritereSearchOuvrage
  ): Observable<any> {
    let requestUrl = "/ouvrage";
    // maitre d'ouvrage
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "referenceMaitreOuvrage",
      encodeURIComponent(criteresRechercheOuvrage.maitreOuvrage)
    );
    // type d'ouvrage
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "typeOuvrage",
      criteresRechercheOuvrage.typeOuvrage.code
    );
    // etat de l'ouvrage
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "etat",
      criteresRechercheOuvrage.etat.code
    );
    // departement
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "numDepartement",
      criteresRechercheOuvrage.departement.numero
    );
    // commune
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "numInseeCommune",
      criteresRechercheOuvrage.commune.numInsee
    );
    // Libelle
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "libelle",
      criteresRechercheOuvrage.libelle
    );
    // page à afficher
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "numeroPage",
      criteresRechercheOuvrage.pageAAficher
    );
    // nombre élément par page
    requestUrl = MethodeGenerique.buildApiUrlByCriteria(
      requestUrl,
      "nombreElementPage",
      criteresRechercheOuvrage.nbElemPerPage
    );
    return this._httpClient.get<Ouvrage>(
      `${this._appService.environment.BACKEND}${requestUrl}`,
      { headers: this._customHeaders }
    );
  }

  getDispositifsNonCloturesByType(
    typeDispositifId: number
  ): Observable<Dispositif[]> {
    const url = `${
      this._appService.environment.BACKEND
      }/dispositif/actif?typeDispositifId=${typeDispositifId}`;
    return this._httpClient.get<Dispositif[]>(url, {
      headers: this._customHeaders
    });
  }
}

/**
 * Manages the read / write mode on components depending on the phase of a given dossier
 * TODO : Move elsewhere later on
 */
export class ComponentViewRightMode implements OnDestroy {
  /**
   * Mode Read or Right
   */
  viewRight: boolean;

  /**
   * dossier Administratif
   */
  viewAdministratif: boolean;

  /**
   * used to manage dossiers
   */
  private _dossierServiceReference: DossierService;

  /**
   *  subscription on dossier phase
   */
  private _dossierServiceSubscription: Subscription;

  constructor(dossierService: DossierService) {
    this._dossierServiceReference = dossierService;

    // Updates the phase when the dossier is updated
    if (this._dossierServiceReference.dossierPhase$) {
      this._dossierServiceSubscription = this._dossierServiceReference.dossierPhase$.subscribe(
        phaseUpdated => {
          this.viewRight = phaseUpdated;
        }
      );
    }

    if (this._dossierServiceReference.dossierAdministratif$) {
      this._dossierServiceSubscription = this._dossierServiceReference.dossierAdministratif$.subscribe(
        phaseUpdated => {
          this.viewAdministratif = phaseUpdated;
        }
      );
    }

    // Initializes with the current viewRight depending on the phase
    if (
      this._dossierServiceReference.dossier &&
      this._dossierServiceReference.dossier.phase === "T40"
    ) {
      this.viewRight = true;
    } else {
      this.viewRight = false;
    }
    // Initializes with the current viewAdministratif depending on the statutPhase
    if (
      this._dossierServiceReference.dossier &&
      this._dossierServiceReference.dossier.statutPhase === "A"
    ) {
      this.viewAdministratif = true;
    } else {
      this.viewAdministratif = false;
    }
  }

  /**
   * Destroys pending subscriptions
   */
  ngOnDestroy() {
    if (this._dossierServiceSubscription) {
      this._dossierServiceSubscription.unsubscribe();
    }
  }
}
