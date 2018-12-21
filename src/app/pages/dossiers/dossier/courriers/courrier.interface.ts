import { Beneficiaire, ResponsableTechnique } from '../../create-dossier/create-dossier.interface';

export interface Courrier {
  id: number;
  titre?: string;
  famille?: string;
  application?: string;
  codeDocument: string;
  reference: string;
  createur?: string;
  responsable?: string;
  dateCreation?: Date;
  dateModification?: Date;
  dateCreationLong?: number;
  dateModificationLong?: number;
  fichier?: string;
  fichierContentType?: string;
  urlFichier: string;
  urlOffice: string;
  objet: string;
  redacteur: string;
  destinataire: string;
  visualiser?: string;
}

export interface Destinatiare {
  code: string;
  titre: string;
  adresse: string;
  codePostale: string;
  commune: string;
  reference: string;
  raisonSociale: string;
  actif: boolean;
  status: string;
}


export interface CourrierFields {
  id?: number;
  modele: ModeleGCD;
  destinataire: Beneficiaire;
  dateCreation: Date;
  avisDeReception: boolean;
  piecesJointes: string;
  vosReferences1: string;
  vosReferences2: string;
  referenceGCA: string;
  numDossier: string;
  nosReferences: string;
  contact: ResponsableTechnique;
  copieInformation: string;
  objet: string;
  signataire: ResponsableTechnique;
}

export interface ModeleGCD {
  type: string;
  code: string;
}

export const MOCKModele: ModeleGCD[] = [{
  type: 'Autre',
  code: '66309a2-5f7a-4e2c-bc3b-e521cb2Beead',
},
{
  type: 'Zotr',
  code: '6495df-5ds1-52zd-dc5e-zd1z5eeef15V'
}]
