import { ListValeur } from 'app/pages/dossiers/dossiers.interface';
import { LocalDataSource } from 'ng2-smart-table';

import { Caracteristique, MasseEau } from '../../../dossier.interface';

export interface Ouvrage {
  id: number;
  typeOuvrage: TypeOuvrage;
  codeAgence: string;
  libelle: string;
  libelleEtat: string;
  caracteristiqueOuvrage?: Caracteristique[];
  impactOuvrages?: ImpactOuvrages[];
  masseEaux: MasseEau[];
  disable?: boolean;
  expanded?: boolean;
  settings?: any;
  source?: LocalDataSource;
  settingsImpacts?: any;
  sourceImpacts?: LocalDataSource;
  hasError?: boolean;

}
export interface TypeOuvrage extends ListValeur {
  typeInterface?: string;

}

export interface ImpactOuvrages {
  id?: number;
  parametreDonneeSpec: ParametreDonneeSpec;
  valeurDate: any,
  valeurString: any,
  valeurInteger: any;
  valeurDouble: any;
  valeurListe: any;
  erreurValeur?: boolean;
}

export interface ParametreDonneeSpec {
  id?: number;
  typeDiscriminant: string;
  codeDiscriminant: string;
  codeParam: string;
  label: string;
  typeDonnee: string;
  tailleDonnee: number;
  codeListe: string;
  noOrdre: number;
}


export interface ValeursPossibles {
  id?: number;
  codeParam: string;
  libelleParam: string;
  code: string;
  libelle: string;
  texte: string;
  noOrdre: string;
}


