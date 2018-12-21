import { NiveauPriorite } from 'app/pages/dossiers/dossier/dossier.interface';
import { Dossier, ListValeur } from 'app/pages/dossiers/dossiers.interface';

export interface DossierResult extends Dossier {
  sessionDecisionPrevi: ListValeur;
  priorite: NiveauPriorite;
  checked: Boolean

}


export interface DossierPrevGestion {
  id: number;
  idPriorite: number;
  anneeEngagPrevi: number;
  idSessionDecisionPrevi: number;
}
