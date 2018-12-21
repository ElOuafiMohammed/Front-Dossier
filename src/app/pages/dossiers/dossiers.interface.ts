import {
  DossierCreate,
  ResponsableTechnique
} from "../dossiers/create-dossier/create-dossier.interface";
import { Courrier } from "./dossier/courriers/courrier.interface";
import {
  Avis,
  DispositionsFinancieres,
  Domaine,
  DossierAdmin,
  DossierUpdate,
  EncadrementCommJustif,
  EngagementsParticuliers,
  ModalitesReduction,
  ModalitesVersement,
  NiveauPriorite,
  Operation,
  ProcedureDecision,
  SessionDecision,
  SldNonStandard,
  TypeDispositif,
  Typologie
} from "./dossier/dossier.interface";
import { Correspondant } from "./dossier/interlocuteurs/correspondant.interface";
import { PieceJointe } from "./dossier/pieces-jointes/pieces-jointes.interface";
import { CoFinanceur } from "./dossier/plan-financement/tableau-dynam-cofinancements/tableau-dynam-cofinancements-interface";
import { Libelle } from "./dossier/previsionnel/tableau-dynam-prev/tableau-dynam-prev-interface";
import { Remarque } from "./dossier/remarque/remarque.interface";
import { RefusDossier } from "./refuse-dossier-popup/refuse-dossier-popup.interface";

export interface DossierBase {
  intitule: string;
}

export interface Interlocuteur {
  id?: string;
  reference: string;
  raisonSociale: string;
  raisonSociale1?: string;
  raisonSociale2?: string;
  actif: boolean;
  actifLibelle: string;
  status: string;
  address: Address;
  commune: Commune;
}

export interface Dossier extends DossierCreate, DossierUpdate {
  id: number;
  noOrdre: number;
  noOrdreFormate: string;
  numeroDossier: string;
  refusDossier: RefusDossier;
  operationDossier?: OperationDossier;
  documentsDossier?: DocumentsDossier;
  dossierFinancier?: DossierFinancier;
  planFinancementDossier?: PlanFinancementDossier;
  texteRecapDtp?: string;
  modaliteVersementTexte?: string;
  texteRecapModaliteReduction?: string;
  referenceBenef?: string;
  preDossier?: PreDossier;
  numeroAid?: string;
  domaine?: Domaine;
  descriptionOperation?: string;
  resultatsAttendus?: string;
  descriptifTechnique?: DescriptifTechnique;
  derogationJustif?: string;
  derogatoire?: boolean;
  procedureDecision?: ProcedureDecision;
  margeAvenir?: boolean;
  margeAvenirJustif?: string;
  sessionDecision?: SessionDecision;
  totalPrixEauTtc?: number;
  totalPrixHtva?: number;
  valideRl?: boolean;
  valideSga?: boolean;
  avis?: Avis;
  motifAvis?: string;
  dossierCorrespondance?: DossierCorrespondance;
  dossierAdmin?: DossierAdmin;
  totalMontantAide?: number;
  expanded?: boolean;
  courriers?: Courrier[];
  donneeSpecifiqueThema?: DonneeSpecifiqueThema[];
  displayDescGenerale?: boolean;
  checked?: Boolean;
  correspondants?: Correspondant[];
  responsableAdministratif: ResponsableTechnique;
  loginRespAdm: string;
}
export interface PlanFinancementDossier {
  coFinanceurs: CoFinanceur[];
}
export interface LignePrev {
  id: number;
  ligne: Libelle;
  montantAidePrev: number;
  montantTravauxPrev: number;
}

export interface CritereSearchBeneficiaire {
  nom?: string;
  departement?: Departements;
  commune?: Commune;
  siren?: string;
  nic?: string;
  numeroAgence?: string;
  inactif?: boolean;
  nbElemPerPage: number;
  pageAAficher?: number;
}

export interface Commune {
  nomCommune: string;
  numInsee: string;
}

export interface CoutsTravaux {
  id?: number;
  libelleCout: string;
  montantEligible: number;
  montantOperation: number;
  montantRetenu: number;
  hasError?: boolean;
  idFront?: number;
  errorMessage?: string;
  montantCoutError?: boolean;
}

export interface PreDossier {
  anneeEngagPrevi: number;
  niveauPriorite: NiveauPriorite;
  sessionDecision: SessionDecision;
  lignesPrevisionnel?: LignePrev[];
  totalMontantAidePrev?: number;
  totalMontantTravauxPrev?: number;
  dispositifPartenariats?: Dispositif[];
  typologie?: Typologie;
}

export interface OperationDossier {
  operations: Operation[];
}

export interface DossierFinancier {
  delaiFinValidite?: number;
  dispositionsFinancieres?: DispositionsFinancieres[];
  sldsNonStandardsFinancieres?: SldNonStandard[];
  engagementsParticuliers?: EngagementsParticuliers[];
  modaliteReductions?: ModalitesReduction[];
  modaliteVersement?: ModalitesVersement;
  lignesAide?: LignesAide[];
  totalMontantOperation?: number;
  totalMontantEligible?: number;
  totalMontantRetenu?: number;
  totalMontantAvance?: number;
  totalMontantSubvention?: number;
  totalMontantAide?: number;
  tauxMontantAide?: number;
  totalEquivalentSubventionAgence?: number;
  encadrementComm?: boolean;
  encadrementCommJustifs?: EncadrementCommJustif[];
  /*   formDocAttrib?: FormDocAttrib;
    typDocAttrib?: TypeDocAttrib; */
}

export interface DossierCorrespondance {
  remarques: Remarque[];
}

// US Info Spécifique 2561
export interface DonneeSpecifiqueThema {
  id: number;
  parametreDonneeSpec: PrarametreDonneSpec;
  valeurDate?: Date;
  valeurDouble?: number;
  valeurListe?: ListValeur;
  valeurString?: string;
  valeurInteger?: number;
  valeursListe?: ListValeur[];
  codeDiscriminant?: string;
}
// US Info Spécifique 2561
export interface ValeurListe {
  code: string;
  codeParam: string;
  id: number;
  libelle: string;
  libelleParam: string;
  noOrdre: number;
  texte: string;
}
// US Info Spécifique 2561
export interface PrarametreDonneSpec {
  id: number;
  codeDiscriminant: string;
  codeListe: string;
  codeParam: string;
  label: string;
  noOrdre: number;
  tailleDonnee: number;
  typeDiscriminant: string;
  typeDonnee: string;
}

// US Info Spécifique 2561

export enum EnumValeurType {
  "N" = "Entier",
  "S" = "Texte",
  "R" = "Décimal",
  "L1" = "Liste",
  "L2" = "Liste multi choix",
  "D" = "Date"
}

export interface ListValeur {
  id: number;
  libelle: string;
  code: string;
  codeParam?: string;
  libelleParam?: string;
  texte?: string;
  noOrdre?: number;
  codeThematique?: string;
  valide?: boolean;
  toDelete?: boolean;
}

export interface ApplicationParam {
  codeParam: string;
  id: number;
  libelleParam: string;
  valeurDate: Date;
  valeurStr: string;
}

interface Beneficiaire {
  reference: string;
}

export interface AvisDossier {
  id: number;
  codeAvis: string;
  motifAvis: string;
}

export interface Dispositif {
  id?: number;
  typeDispositif: TypeDispositif;
  numeroOrdre: number;
  complementIntitule: string;
  urlFrontDispositifPartenariat: string;
  disable?: boolean;
  numeroOrdreFormatted?: string;
  isSansObjet: boolean;
}

export interface LignesAide {
  id: number;
  ligne: string;
  montantOperation: number;
  montantEligible: number;
  montantRetenu: number;
  montantAvance: number;
  montantSubvention: number;
  totalMontantAide: number;
  tauxAide: number;
}

export interface DocumentsDossier {
  documents: PieceJointe[];
}

export interface DescriptifTechnique {
  id: number;
  titre: string;
  dateCreation: number;
  dateModification: Date;
  createur: string;
  fichier: string;
  fichierContentType: string;
  urlFichier: string;
  urlOffice: string;
  codeDoc: string;
  reference: string;
  fileProperties?: File;
}

export interface Address {
  titreCivilite: string;
  adresse1: string;
  adresse2: string;
  adresse3: string;
  adresse4: string;
  adresse5: string;
  adresse: string;
  codePostal: string;
  acheminement: string;
  formulesPolitesse: string[];
}

export interface Departements {
  id: number;
  nomDept: string;
  numero: string;
  bassins?: string[];
}

export const TextMRA =
  "Le texte associé est affiché ici lorsqu'au moins une modalité de réduction est sélectionnée.";
export const TextTDP =
  "Le texte associé est affiché ici lorsqu'au moins une disposition technique particulière est sélectionnée.";
export const IncrementRegex: RegExp = /^(\d){5}$/;
export const BenefRegex: RegExp = /^(\d){8}([A-Za-z])$/;
export const TelephoneRegex: RegExp = /^(0|(00|\+)([1-9][0-9]|[1-9][0-9]{2}))[1-9][0-9]{8}$/;
export const FourDigitRegex: RegExp = /^\d{4}$/;
export const EmailRegex: RegExp = /^(([^<>()\[\]\\.,;*?:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * Regex utilisiée pour gérer le format de date
 */
// tslint:disable-next-line:max-line-length
export const FrenchDateRegex: RegExp = /^((([1-9])|(0[1-9])|([12])([0-9]?)|(3[01]?))(-|\/?)(0?[13578]|10|12)(-|\/?)((19)([5-9])(\d{1})|(20)([0-9])(\d{1})|([0-9])(\d{1}))|(([1-9])|(0[1-9])|([12])([0-9]?)|(3[0]?))(-|\/?)(0?[2469]|11)(-|\/?)((19)([5-9])(\d{1})|(20)([0-9])(\d{1})|([0-9])(\d{1})))$/;

export const NumberRegex: RegExp = /^[0-9]*$/;
export const NumberNumeroOpRegex: RegExp = /^[0-9]{2}/;
export const NumberNumeroSDRegex: RegExp = /^\d{1,2}$/;
export const NumberAnneeSDRegex: RegExp = /^[0-9]{4}/;
export const NumberOrSpaceRegex: RegExp = /^0|[^0-9 ]+/g;
export const DoublePositiveNumberRegex: RegExp = /^[+]?([0-9]*[.])?[0-9]+$/;
export const DispositifIncrementRegex: RegExp = /^(\d){4}$/;
// export const NameRegex: RegExp = /^[a-zA-Z]|[a-zA-Z]*/;
export const SirenRegex: RegExp = /^[0-9]{9}/;
export const NicRegex: RegExp = /^0[0-9]{4}/;
