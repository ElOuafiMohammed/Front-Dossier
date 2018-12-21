export enum EnumActionDossier {
  BASCULER = 'BASCULER', // action de basculer preDossier en dossier
  VALIDER = 'VALIDER', // action de valider
  DEVALIDER = 'DEVALIDER', // action de dévalider
  AFFECTER_SESSION = 'AFFECTER_SESSION', // action de d'affectation d'un session de decision
  RETIRER_SESSION = 'RETIRER_SESSION', // action de retrait d'un session de decision
  AVISER = 'AVISER',
  ATTRIBUER_AIDE = 'ATTRIBUER_AIDE',
  VERIFIER_ATTRIB = 'VERIFIER_ATTRIB',
  SIGNER_ATTRIB = 'SIGNER_ATTRIB'
}

export enum EnumProfilDossier {
  RT = 'RT', // RT
  DELEGUE = 'DELEGUE', // délégué
  SGA = 'SGA', // SGA  - siege
  RL = 'RL', // RL  - siege
  DGA = 'DGA', // DGA
  RA = 'RA', // RA
  CAA = 'CAA' // CAA
}

export enum EnumFormeAide {
  A = 'Avance',
  S = 'Subvention'
}

export enum EnumParametrage {
  A_LISTVAL = 'Liste_valeur',
  B_OP = 'Nature_operation',
  C_SESSION = 'Session_decision',
  D_LIGNE = 'Ligne',
  E_FINANCEUR = 'Financeur'
}

export enum EnumListValeur {
  LIST_PARAM = 'LIST_PARAM',
  THEMA = 'THEMA',
  NATREF = 'NATREF',
  NIVPRIO = 'NIVPRIO',
  ORIDDE = 'ORIDDE',
  THEME = 'THEME',
  DOMAINE = 'DOMAINE',
  TYPOLOGIE = 'TYPOLOGIE',
  ENGA_PART = 'ENGA_PART',
  DISPO_FINAN = 'PIECE_SOLDE',
  PROC_DECI = 'PROC_DECI',
  MODA_REDUC = 'MODA_REDUC',
  MODA_VERS = 'MODA_VERS',
  TYPE_OUV = 'TYPE_OUV',
  ENCAD_JUSTIF = 'ENCAD_JUSTIF',
  DELEGATION = 'DELEGATION',
  PHASE = 'PHASE',
  ENJEU = 'ENJEU',
  TYPE_DOC = 'TYPE_DOC',
  PAYS = 'PAYS',
  ZONE_PRIO = 'ZONE_PRIO',
  ACTION_PRIO = 'ACTION_PRIO',
  AVIS = 'AVIS',
  TYPE_ACTION = 'TYPE_ACTION',
  ETAT_OUV = 'ETAT_OUV',
  USAG = 'USAG',
  TYP_DOC_ATTRIB = 'TYP_DOC_ATTRIB',
  FORM_DOC_ATTRIB = 'FORM_DOC_ATTRIB',
  QUALITE_CONTACT = 'QUALITE_CONTACT',
  ROLE_CORRESP = 'ROLE_CORRESP'
}

export enum EnumCodeApplicationParam {
  DATE_ATTRIB = 'DATE_ATTRIB',
  DELAI_FIN_VALID = 'DELAI_FIN_VALID',
  COEF_EQ_SUB = 'COEF_EQ_SUB'
}

export enum EnumValeurType {
  Entier = 'E',
  Texte = 'S',
  Décimal = 'R',
  Liste = 'L1',
  ListeMultiChoix = 'L2',
  Date = 'D'
}

