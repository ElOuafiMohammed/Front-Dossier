import { LocalDataSource } from 'ng2-smart-table';

import { Interlocuteur } from '../../dossiers.interface';
import { QualiteContact, RoleCorrespondant } from '../dossier.interface';

export interface Correspondant {
  id?: number;
  correspondant: Interlocuteur;
  referenceCorresp: string;
  roleCorrespondant?: RoleCorrespondant;
  contacts?: Contact[];
  expanded?: boolean;
  settingContact?: any;
  sourceContact?: LocalDataSource;
  hasError?: boolean;
  messageErreur?: string;
}
export interface Contact {
  id?: number;
  nom?: string;
  prenom?: string;
  numeroTel?: string;
  mail?: string;
  qualiteContact?: QualiteContact;
  erreurValeur?: boolean;
}
