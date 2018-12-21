import { ApplicationParam, Departements, Dispositif, Dossier, DossierBase, ListValeur } from '../dossiers.interface';
import { RefusDossier } from '../refuse-dossier-popup/refuse-dossier-popup.interface';
import { EnumActionDossier, EnumProfilDossier } from './enumeration/enumerations';
import { Ouvrage } from './nature-operation/ouvrage/tableau-dynamique-ouvrage/tableau-dynamique-ouvrage.interface';

export interface DossierUpdate extends DossierBase {
  phase: string;
  statutPhase?: string;
  dateDemande?: Date;
  dateComplet?: Date;
  blocNote?: string;
  origineDemande?: OrigineDemande
}

export class Tooltip {
  readonly labelNature = 'Nature de refus :';
  readonly labelMotif = 'Motif  : ';
  readonly libelleNature = null;
  readonly libelleMotif = null

  constructor(refusDossier: RefusDossier) {
    this.libelleNature = refusDossier.natureRefus.libelle;
    this.libelleMotif = refusDossier.motifRefus;
  }
}

export interface SessionDecision {
  annee: string,
  id: number,
  numero: string,
  type: string,
  date?: Date,
  toDelete?: boolean,
  hasError?: boolean,
  dateError?: boolean,
  numeroError?: boolean,
  anneeError?: boolean,
  disable?: boolean,
  modif?: boolean
}
export interface DossierAdmin {
  idDossier: number,
  dateAttribution: Date,
  dateFinValidite: Date,
  numeroAttributif: string,
  numerosAide: NumeroAideDossier[],
  formDocAttrib?: FormDocAttrib,
  typDocAttrib?: TypeDocAttrib,
  travauxOuvrage?: boolean,
  verifsDossier: Verification
}

export interface Verification {
  id: number,
  verif?: boolean,
  dateVerif: Date,
  role: string,
  login: string,

}

export interface NumeroAideDossier {
  id: number,
  ligne: string,
  annee: number,
  formeAide: string,
  version: string,
  numeroAide: string,
  montantAide: number

}
export interface SldNonStandard {
  id: number, libelle: string
}
export interface OrigineDemande extends ListValeur {
  typeInterface?: string;

}
export interface Avis extends ListValeur {
  typeInterface?: string;

}
export interface LastDateAttribution extends ApplicationParam {
  typeInterface?: string;

}
export interface DelaiFinValidite extends ApplicationParam {
  typeInterface?: string;

}


export interface EngagementsParticuliers extends ListValeur {
  typeInterface?: string;

}

export interface DispositionsFinancieres extends ListValeur {
  typeInterface?: string;

}

export interface ModalitesReduction extends ListValeur {
  typeInterface?: string;
}
export interface ModalitesVersement extends ListValeur {
  typeInterface?: string;

}

export interface EncadrementCommJustif extends ListValeur {
  typeInterface?: string;

}

export interface NiveauPriorite extends ListValeur {
  typeInterface?: string;

}
export interface CoutsTravaux {
  id: number,
  libelleCout: string,
  montantEligible: number | string;
  montantOperation: number | string,
  montantRetenu: number | string,
  hasError?: boolean,
  idFront?: number,
  montantCoutError?: boolean;

}
export interface NatureOperation {
  id: number;
  ligne: string,
  numero: string,
  libelle: string;
  dateDebutValidite?: string,
  dateFinValidite?: string,
  codeThematique: string,

  hasError?: boolean,
  dateError?: boolean,
  numeroError?: boolean,
  disable?: boolean,
  modif?: boolean,
  toDelete?: boolean;
}

export interface Lignes {
  codeThematique: string;
  dateDebutValidite?: string;
  dateFinValidite?: string;
  id?: number;
  libelle: string;
  numero: string;
  toDelete?: boolean;
  valide?: boolean;
  hasError?: boolean;
  dateError?: boolean;
  numeroError?: boolean;
  disable?: boolean;
  modif?: boolean;


}

export class DispositifPartenariatOperation {
  id?: number;
  numeroOrdre: number;
  idDispositifPartenariat: number;
  typeDispositifPartenariat: TypeDispositif;
  dispositifPartenariat: Dispositif;
  complementIntitule: string;
  montantAvance: number;
  pourcentageAvance: string;
  montantSubvention: number;
  pourcentageSubvention: string;
  urlFrontDispositifPartenariat: string;
  erreurSubvention?: boolean;
  erreurAvance?: boolean;

}

export class Operation {
  natureOperation: NatureOperation;
  totalMontantEligible: number;
  totalMontantOperation: number;
  totalMontantRetenu: number;
  totalMontantRetenuPlafonne?: number;
  id?: number;
  themes?: Theme[];
  coutsTravaux?: CoutsTravaux[];
  ouvrageNatureOperation?: Ouvrage[];
  dispositifPartenariatOperation?: DispositifPartenariatOperation[];
  lignesMasseEau: MasseEau[];
  specificiteCalcul?: string;
  montantAvance?: number;
  montantAvanceEqSubvention?: number;
  montantSubvention?: number;
  tauxAvance?: number;
  tauxSubvention?: number;
  tauxSpecifique?: number;
  montantEqSubventionSpecifique?: number;
  enableMessageError?: boolean;
  masseEauError?: boolean;
  dispositifRattacheError?: boolean;
  montantCoutError?: boolean;
  erreurMontant?: boolean;
  messageErrorDispositif?: string;
  messageErrorMasseEau?: string;
  ouvrageError?: boolean;
  noOrdre: number;
  regions?: Regions[];
  departements: Departements[];
  communes: Communes[];
  localisationPertinente: boolean
  bvGestionNatureOperations?: BvGestion[];
  bvGestionError?: boolean;
  inputErreur?: string;
  regionError?: boolean;
  inputRegionErreur?: string;
  departementError?: boolean;
  inputDepartementErreur?: string;
  communeError?: boolean;
  inputCommuneErreur?: string;
  isErreurCumulMontantAvance?: boolean;
  isErreurCumulMontantSubvention?: boolean;
  localisationPertinenteError?: boolean;

  constructor(natureOperation: NatureOperation) {
    return {
      natureOperation,
      totalMontantEligible: 0,
      totalMontantOperation: 0,
      totalMontantRetenu: 0,
      id: null,
      coutsTravaux: [],
      themes: null,
      totalMontantRetenuPlafonne: 0,
      specificiteCalcul: null,
      ouvrageNatureOperation: [],
      lignesMasseEau: [],
      dispositifPartenariatOperation: [],
      montantAvance: 0,
      montantAvanceEqSubvention: 0,
      montantSubvention: 0,
      tauxAvance: 0,
      tauxSubvention: 0,
      dispositifRattacheError: false,
      montantCoutError: false,
      erreurMontant: false,
      ouvrageError: false,
      messageErrorDispositif: '',
      messageErrorMasseEau: '',
      noOrdre: 1,
      regions: null,
      departements: null,
      communes: null,
      localisationPertinente: false,
      bvGestionNatureOperations: [],
      bvGestionError: false,
      inputErreur: '',
      departementError: false,
      inputDepartementErreur: null,
      communeError: false,
      inputCommuneErreur: '',
      isErreurCumulMontantAvance: false,
      isErreurCumulMontantSubvention: false,
      localisationPertinenteError: false,
    };
  }
}

export interface Regions {
  id: number;
  nomRegion: string;
  numero: string;
}

export interface Communes {
  id: number;
  nomCommune: string;
  numInsee: string;
}

export interface MasseEau {
  code: string;
  nom: string;
  categorieCode: string;
  categorieLibelle: string;
  commissionTerritorialeCode: string;
  commissionTerritorialeLibelle: string;
  hasError?: boolean;
}

export interface DossierAction {
  action: EnumActionDossier;
  ids: number[];
  profil?: EnumProfilDossier;
  dossier?: Dossier;
  idSessionDecision?: number;
  dateAttributionAide?: string;

}

export interface TypeDispositif extends ListValeur {
  typeInterface?: string;

}

export interface Theme extends ListValeur {
  typeInterface?: string;

}

export interface CoefficientConversion extends ApplicationParam {
  valeurCoef: number;
}

export interface Domaine extends ListValeur {
  typeInterface?: string;

}

export interface Typologie extends ListValeur {
  typeInterface?: string;

}

export interface TypeDocAttrib extends ListValeur {
  typeInterface?: string;


}
export interface FormDocAttrib extends ListValeur {
  typeInterface?: string;


}
export interface ProcedureDecision extends ListValeur {
  typeInterface?: string;

}
export interface RoleCorrespondant extends ListValeur {
  typeInterface?: string;

}
export interface QualiteContact extends ListValeur {
  typeInterface?: string;

}

export interface BvGestion {
  id: number;
  numero: string;
  nom: string;
  selected?: boolean;
}
export interface Caracteristique {
  code: string;
  libelle: string;
  typeDonnee: string;
  // caracteristique: string;
  valeur: string;
}

export const urlIconDocument = {
  url_pdf: './assets/img/documents-icon/icon_file_pdf.svg',
  url_word: './assets/img/documents-icon/icon_file_word.svg',
  url_excel: './assets/img/documents-icon/icon_file_excel.svg',
  url_unknown: './assets/img/documents-icon/icon_file_unknown.svg',
  url_image: './assets/img/documents-icon/icon_file_image.svg',
  url_txt: './assets/img/documents-icon/icon_file_text.svg'
}
