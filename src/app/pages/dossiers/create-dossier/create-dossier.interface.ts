import { DossierBase, Interlocuteur, ListValeur } from '../dossiers.interface';

export interface DossierCreate extends DossierBase {
  thematique: Thematique;
  departement: string;
  beneficiaire: Beneficiaire;
  responsableTechnique: ResponsableTechnique;
  responsableAdministratif: ResponsableTechnique;
}

export interface ResponsableTechnique {
  login: string;
  prenom: string;
  nom: string;
  email: string;
  organisation: string;
  telephone: string;
}

// TODO : Voir pour un extend de ListValeur plus tard ??
// Impossible pour le moment => casse les tests puisque le champ 'id' n'est pas un number dans ce cas là
// export interface Departement {
//   id: string;
//   libelle: string;
//   code: string;
// }

export interface Thematique extends ListValeur {
  typeInterface?: string;

}
export interface Avis extends ListValeur {
  id: number;
  codeAvis?: string;
  motifAvis?: string;
}

export interface Ligne extends ListValeur {
  numero: string;
}

export interface Beneficiaire extends Interlocuteur {
  typeInterface?: string;
}

export interface Phase extends ListValeur {
  typeInterface?: string;
}

export interface Enjeu extends ListValeur {
  typeInterface?: string;

}

export interface Pays extends ListValeur {
  typeInterface?: string;

}
export interface ZonePrio extends ListValeur {
  typeInterface?: string;

}
export interface TypeDocument extends ListValeur {
  typeInterface?: string;

}
export interface TypeAction extends ListValeur {
  typeInterface?: string;

}

export interface ActionPrio extends ListValeur {
  typeInterface?: string;

}
