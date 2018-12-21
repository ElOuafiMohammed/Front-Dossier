import { DataSource } from '@angular/cdk/table';
import { HttpErrorResponse } from '@angular/common/http';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { BehaviorSubject, Observable } from 'rxjs';

import { PieceJointe } from '../pieces-jointes.interface';

export class PiecesJointesDataSource implements DataSource<PieceJointe> {

  /**
   * Piece jointe subject
   */
  private piecesJoinesSubject: BehaviorSubject<PieceJointe[]>;

  /**
   * Tableau de pièce jointe
   */
  private picesJointesData: PieceJointe[] = [];

  /**
   * Constructeur de la classe
   * @param dossierService 
   */
  constructor(private dossierService: DossierService) {

    this.piecesJoinesSubject = new BehaviorSubject<PieceJointe[]>([]);

    this.dossierService.dossier$.subscribe(dossierReady => {
      // Si dossierService et this.dossierService.dossier ne sont pas null
      if (this.dossierService && this.dossierService.dossier) {
        // Si documentsDossier n'est pas null
        if (this.dossierService.dossier.documentsDossier) {
          this.picesJointesData = this.dossierService.dossier.documentsDossier.documents;
          this.loadPiecesJointes();
        }
      }
    });
  }

  /**
   * Redéfinition de la fonction connect
   * de l'interface data source.
   */
  connect(): Observable<PieceJointe[]> {
    return this.piecesJoinesSubject.asObservable();
  }

  /**
   * Chargement des piéces jointes pour la table
   * à travers le subject piéce jointe.
   */
  loadPiecesJointes() {
    this.piecesJoinesSubject.next(this.picesJointesData);
  }

  /**
   * Ajout de nouvelles données et rechargement 
   * des données sur table.
   * @param piecesJointes 
   */
  ajoutPieceJointe(piecesJointes: PieceJointe[]) {

    /**
     * Si le paramètre tableau de pièce jointe n'est pas null
     * et le tableau de pièce jointe n'est pas null
     */
    if (piecesJointes && this.picesJointesData) {

      // Ajout des pièces jointes dans le tableau de pièce jointe
      piecesJointes.forEach(piece => this.picesJointesData.push(piece));

      // Si le dossier en cours et l'objet document ne sont pas null
      if (this.dossierService.dossier && this.dossierService.dossier.documentsDossier) {
        this.dossierService.dossier.documentsDossier.documents = this.picesJointesData;
      }

      // Rechargement des pièces jointes
      this.loadPiecesJointes();
    }
  }

  /**
   * Permet de supprimer une piéce jointe
   * et recharge les données de la table 
   * @param pieceJointe
   */
  supprimePieceJointe(pieceJointe: PieceJointe) {

    /** 
     * Si la pièce jointe n'est pas null et qu'il y a au moins une donnée
     * dans le tableau des piéces jointes.
     */
    if (pieceJointe && this.picesJointesData.length > 0) {
      // Récuperation de l'index de la pièce jointe
      const index = this.picesJointesData.indexOf(pieceJointe);
      // Suppression de la pièce jointe au niveau du backend
      this.dossierService.deletePieceJointe(pieceJointe.codeDoc)
        .subscribe(() => {
          // Suppression de la pièce jointe au niveau du tableau des piéces jointes
          this.picesJointesData.splice(index, 1);
          this.loadPiecesJointes();
        },
          (error: HttpErrorResponse) => {
            console.error(error);
          });
    }
  }

  /**
   * Retourne le monbre d'élément que contient le tableau
   * des pièces jointes.
   */
  getLength(): number {
    return this.picesJointesData.length;
  }
  /**
   * Redéfinition de la fonction disconnect
   * de l'interface data source.
   */
  disconnect() {
    this.piecesJoinesSubject.complete();
  }
}
