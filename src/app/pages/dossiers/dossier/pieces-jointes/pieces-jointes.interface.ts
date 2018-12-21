export interface PieceJointe {
  id: number;
  titre: string;
  dateCreation: number;
  dateModification: Date;
  createur: string;
  fichier: string;
  fichierContentType: string;
  urlFichier: string;
  urlOffice: string;
  codeDoc: string;
  reference: string;
  fileProperties?: File
}

