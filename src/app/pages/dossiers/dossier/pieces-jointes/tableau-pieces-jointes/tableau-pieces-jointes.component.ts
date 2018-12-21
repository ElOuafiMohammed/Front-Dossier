import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AccueilService } from 'app/pages/dossiers/accueil/accueil.service';
import { urlIconDocument } from 'app/pages/dossiers/dossier/dossier.interface';
import { ComponentViewRightMode, DossierService } from 'app/pages/dossiers/dossiers.service';

import { SpinnerLuncher } from '../../../../../shared/methodes-generiques';
import { PieceJointe } from '../pieces-jointes.interface';
import { PiecesJointesDataSource } from './pieces-jointes-data-source';



@Component({
  selector: 'siga-tableau-pieces-jointes',
  templateUrl: './tableau-pieces-jointes.component.html',
  styleUrls: ['./tableau-pieces-jointes.component.scss'],

})
export class TableauPiecesJointesComponent extends ComponentViewRightMode implements OnInit {
  canAdd = true;
  idFile = 'notEditable';
  utilisateurConnecteNomPrenom: string;

  /**
   * Event to manage error to notify parent
   */
  @Output() isPiecesJointesListValid: EventEmitter<any> = new EventEmitter();

  /**
  * error message to display
  */
  enableMessageError: boolean;

  /**
   * Data source des pièces jointes
   */
  pieceJointeDataSource: PiecesJointesDataSource;

  /**
   * Définition des colonnes de la table des pièces jointes
   */
  tableColonne = ['fichierContentType', 'titre', 'createur', 'dateCreation', 'actionSupprimer'];

  constructor(
    private dossierService: DossierService,
    private _accueilService: AccueilService,
    private datePipe: DatePipe,
    private _dossierService: DossierService,
    private translate: TranslateService,
    private spinnerLuncher: SpinnerLuncher
  ) {
    super(dossierService);
    this._accueilService.getUtilisateurConnecte()
      .subscribe(utilisateurConnecte => {
        const emptyTxt = ' ';
        this.utilisateurConnecteNomPrenom = utilisateurConnecte.prenom + emptyTxt + utilisateurConnecte.nom;
      });
    this.pieceJointeDataSource = new PiecesJointesDataSource(this.dossierService);
  }

  /**
   * Initialise les données du tableau
   */
  ngOnInit() {
    this.pieceJointeDataSource.loadPiecesJointes();
  }

  /**
   * Lecture d'une pièce jointe par url
   * 
   * @param docUrl : url fichier à visionner
   */
  openFile(docUrl) {
    if (docUrl) {
      window.open(docUrl, '_blank');
    }

  }

  /**
   * Permet d'ajouter une ou plusieurs piece(s) jointe(s) dans le tableau
   *    reader permet de récuperer les données du fichier importé
   *    ces données sont ajouté à une liste d'objets PieceJointe
   *    ces objets sont ensuite ajoutés au tableau
   * @param file
   */
  onAddLine(file: FileList) {
    this.spinnerLuncher.show();
    let fileProperties: File;

    // liste : document vide pour chaque fichier
    const toAdd: PieceJointe[] = [];

    // liste finale des documents avec les données à créer
    const documentsToUpload: PieceJointe[] = [];

    // Initialisation de la liste de pieces jointes vide
    if (file && file.length > 0) {
      for (let i = 0; i < file.length; i++) {
        fileProperties = file.item(i);
        toAdd.push({
          id: null,
          titre: null,
          dateCreation: null,
          dateModification: null,
          createur: this.utilisateurConnecteNomPrenom,
          fichier: null,
          fichierContentType: null,
          urlFichier: null,
          urlOffice: null,
          codeDoc: null,
          reference: null,
          fileProperties
        });
      }
    }

    // remplir les données pour chaque document
    toAdd.forEach(doc => {
      const reader = new FileReader;
      const now = new Date();
      reader.readAsDataURL(doc.fileProperties);
      reader.onload = () => {
        doc.titre = doc.fileProperties.name;
        doc.fichierContentType = doc.fileProperties.type;
        doc.fichier = reader.result.toString().split(',')[1];
        doc.dateCreation = Date.now();
        doc.dateModification = now;
        documentsToUpload.push(doc);
      }
    });
    let idDossier;
    if (this._dossierService.dossier) {
      idDossier = this._dossierService.dossier.id;
    }

    // appel le service pour créer les documents
    if (documentsToUpload) {
      setTimeout(() => {
        this.canAdd = false;
        this._dossierService.createPieceJointe(documentsToUpload, idDossier)
          .subscribe((documents) => {
            this.enableMessageError = false;
            this.isPiecesJointesListValid.emit(true);
            this.pieceJointeDataSource.ajoutPieceJointe(documents);
            this.canAdd = true;
            this.spinnerLuncher.hide();
          },
            (error: HttpErrorResponse) => {
              this.enableMessageError = true;
              this.isPiecesJointesListValid.emit(false);
              this.spinnerLuncher.hide();
            });
      }, 500);
    } else {
      this.spinnerLuncher.hide();
    }
  }

  /**
   * Permet de supprimer une ligne du tableau
   * @param event
   */
  onDeleteLine(piece) {
    // Si la pièce jointe n'est pas null
    if (piece) {
      this.pieceJointeDataSource.supprimePieceJointe(piece);
    }
  }

  /**
   * Cette fonction permet de chercher le type du fichier
   * et retourne l'icon correspondante au type du fichier.
   * 
   * @param pieceJointe
   */
  getIconPieceJointe(pieceJointe: PieceJointe) {
    // Permet d'afficher un icon
    let icon = '';
    if (pieceJointe) {
      // recherche de l'url fichier de ce type
      if (pieceJointe.fichierContentType === 'application/pdf') {
        icon = urlIconDocument.url_pdf;
      } else if (pieceJointe.fichierContentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        icon = urlIconDocument.url_word;
      } else if (pieceJointe.fichierContentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        icon = urlIconDocument.url_excel;
      } else if (pieceJointe.fichierContentType === 'text/plain') {
        icon = urlIconDocument.url_txt;
      } else if (pieceJointe.fichierContentType === 'image/jpeg' || pieceJointe.fichierContentType === 'image/png') {
        icon = urlIconDocument.url_image;
      } else {
        icon = urlIconDocument.url_unknown;
      }
    }
    return icon;
  }

}

