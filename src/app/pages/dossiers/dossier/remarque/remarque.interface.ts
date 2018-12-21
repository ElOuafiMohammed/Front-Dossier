import { ResponsableTechnique } from '../../create-dossier/create-dossier.interface';

export interface Remarque {
  id: number;
  idFront?: number
  remarque: string;
  dateRemarque: string;
  dateReponse?: string,
  nomPrenomEmetteur: string;
  deleted?: boolean,
  loginEmetteur?: string,
  etat: string,
  loginReponseDe?: string,
  nomPrenomReponseDe?: string,
  loginDestinataire?: string
  reponse?: string
  lu ?: boolean,
  archive ?: boolean,
  destinataire?: ResponsableTechnique,
  hasError?: boolean
}




