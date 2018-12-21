export interface Financeur {
  id: number;
  code: string;
  financeurPublic: boolean;
  libelle: string;
  disable: boolean
}

export interface CoFinanceur {
  id: number;
  financeur: Financeur;
  precision?: string;
  montantAide?: number;
  tauxAide?: number;
  idFront?: number;
}

export interface RecapitulatifCoFinaceur {
  montantOperation: number;
  montantAideAgence: number;
  montantAidePublique: number;
  montantAidePrivee: number;
}

