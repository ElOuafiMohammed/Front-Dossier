import { Ligne, Thematique } from '../create-dossier/create-dossier.interface';

export interface Settings {
  actions?: boolean | Object;
  noDataMessage?: string;
  add?: Object;
  edit?: Object;
  delete?: Object;
  hideSubHeader?: boolean;
  mode?: string;
  columns: { [propName: string]: Object };
  selectMode?: string;
  pager?: any;
}

export interface Critere {
  thematique?: string; // id: thematique.id
  codeThematique?: string; // code: thematique.code
  departement?: string; // id: dept.id
  responsableTech?: string // login du responsable technique
  numeroIncrement?: string // avec 5 chiffres
  codeBenef?: string // 8 chiffres et une lettre majuscule ex: 12345678A
  pageAAficher?: number; // numéro de la page a demander
  nbElemPerPage?: number; // nombre d'élément à afficher par page
  phase?: string; // code: phase.code
  priorite?: string; // id: priorite.id
  procedureDecision?: string; // id: procedureDecision.id
  codeServiceDept?: string; // code: servDept.code
  delegation?: string; // code: Delegation.code
  domaine?: string; // id: domaine.id,
  natureOperation?: string; // id: nature.id
  listNatureOperation?: number[]; // id: nature.id
  devaliderSiege?: boolean;
  session?: string// id session
  dateAttribution?: Date;
  listPhase?: string[];
  sessionPrev?: string// id session
  hasReponseNontraite?: boolean; // dossier has remarque not provided
  annee?: number;
  loginResponsableAdm?: string // login of responsable adminstratif
  isSigne?: boolean // signer ou verifier
}

export interface CritereRemarque {
  loginDestinataire?: string,
  loginEmetteur?: string,
  repondu?: boolean,
  lu?: boolean,
  archive?: boolean,
  nbElemPerPage?: number; // nombre d'élément à afficher par page
  numeroPage?: number,
  idDossier?: number
  emetteur?: string
}

export interface CritereAvis {
  thematique?: string; // id: thematique.id
  procedureDecision: string; // id: procedureDecision.id
  session?: string// id session
}

export interface CritereParametrage {
  thematique?: Thematique; // id: thematique.id
  ligne?: Ligne; // id: ligne.id
  valide?: boolean; // valide
  pageAAficher: number; // numéro de la page a demander
  nbElemPerPage: number; // nombre d'élément à afficher par page
}

export interface CritereNatureOperation extends CritereParametrage {
}
export interface CritereLigne extends CritereParametrage {
}

export interface CritereListValeur extends CritereParametrage {
}

export interface CritereSessionDecision {
  type?: string; // id: procedureDecision.id
  annee?: number; // annee sur 4 chiffres
  numero?: number; // number
  pageAAficher: number; // numéro de la page a demander
  nbElemPerPage: number; // nombre d'élément à afficher par page
}
