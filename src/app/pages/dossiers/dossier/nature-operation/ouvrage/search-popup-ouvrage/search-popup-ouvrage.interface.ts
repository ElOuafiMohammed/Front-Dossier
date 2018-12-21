import { Communes } from 'app/pages/dossiers/dossier/dossier.interface';
import { Departements } from 'app/pages/dossiers/dossiers.interface';

import { TypeOuvrage } from '../tableau-dynamique-ouvrage/tableau-dynamique-ouvrage.interface';

export interface CritereSearchOuvrage {
  maitreOuvrage?: string;
  departement?: Departements;
  commune?: Communes;
  typeOuvrage?: TypeOuvrage;
  etat?: EtatOuvrage;
  libelle?: string;
  nbElemPerPage: number;
  pageAAficher?: number;
}

export interface EtatOuvrage {
  code: string;
  libelle: string;

}
