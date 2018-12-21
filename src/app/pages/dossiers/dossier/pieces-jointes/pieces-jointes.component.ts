import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { ComponentViewRightMode, DossierService } from '../../dossiers.service';
import { PieceJointe } from './pieces-jointes.interface';

@Component({
  selector: 'siga-app-pieces-jointes',
  templateUrl: './pieces-jointes.component.html',
  styleUrls: ['./pieces-jointes.component.scss']
})
export class PiecesJointesComponent extends ComponentViewRightMode implements OnInit {

  pieceJointes: Array<PieceJointe>
  @Output() piecesJointesListParentChanges: EventEmitter<PieceJointe[]> = new EventEmitter();
  @Output() isPiecesJointesListValidParent: EventEmitter<PieceJointe[]> = new EventEmitter();
  constructor(private dossierService: DossierService) {
    super(dossierService);
  }

  /**
   * Recupère les données venant du back, stockées dans le service Dossier
   */
  ngOnInit() {
    this.dossierService.dossier$.subscribe(dossierReady => {
      if (this.dossierService.dossier && this.dossierService.dossier.documentsDossier) {
        this.pieceJointes = this.dossierService.dossier.documentsDossier.documents;
      }

    });
  }

  /**
   * Envoie les données au composant parent (dossier.component.ts) via OUTPUT
   * @param event
   */
  piecesJointesListChanges(event: PieceJointe[]) {
    this.piecesJointesListParentChanges.emit(event);
  }

  isPiecesJointesListValid(valid) {

    this.isPiecesJointesListValidParent.emit(valid)
  }
}
