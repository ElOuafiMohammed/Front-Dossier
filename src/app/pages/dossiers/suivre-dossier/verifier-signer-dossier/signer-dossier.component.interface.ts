import { ListValeur, Dossier } from 'app/pages/dossiers/dossiers.interface';

export interface Delegation extends ListValeur {
  typeInterface?: string;

}

export interface Dossier extends Dossier {
  checked: Boolean
}
