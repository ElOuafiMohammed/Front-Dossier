import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { TranslateService } from '@ngx-translate/core/src/translate.service';

import { ComponentViewRightMode, DossierService } from '../../dossiers.service';
import { CourrierDataSource } from './courrier-data-source';
import { CourrierPopupComponent } from './courrier-popup/courrier-popup.component';
import { Courrier } from './courrier.interface';


@Component({
  selector: 'siga-app-courriers',
  templateUrl: './courriers.component.html',
  styleUrls: ['./courriers.component.scss']
})
export class CourriersComponent extends ComponentViewRightMode implements OnInit {

  responsablesTech

  /**
   * Data source pour la table de courrier
   */
  courrierDataSource: CourrierDataSource;

  /**
   * Tableau contenant les clés uniques des colonnes du table des courriers
   */
  courrierTableColonne = ['reference', 'destinataire', 'objet', 'redacteur'];

  constructor(
    private dossierService: DossierService,
    private translate: TranslateService,
    public dialog: MatDialog,
  ) { super(dossierService); }

  /**
   * initialise les données du tableau
   */
  ngOnInit() {

    this.courrierDataSource = new CourrierDataSource(this.dossierService);
    this.dossierService.dossier$.subscribe(dossierReady => {
      if (this.dossierService.dossier && this.dossierService.dossier.documentsDossier) {
        this.courrierDataSource.loadCourriers(this.dossierService.dossier.id);
      }
    });




  }

  createCourrier() {
    const matDialogCourrier = this.openCourrierPopup();

    matDialogCourrier.afterClosed()
      .subscribe(() => {
        if (matDialogCourrier.componentInstance.courrierGcd) {
          this.courrierDataSource.loadCourriers(this.dossierService.dossier.id);
        }
      });

  }
  /**
   * Ouvre la Popup permettant de remplir les champs du courrier à créer
   */
  openCourrierPopup(): MatDialogRef<CourrierPopupComponent> {
    const config = new MatDialogConfig();
    config.width = '1000px';
    config.disableClose = true;
    config.autoFocus = false;
    config.data = this.dossierService.dossier;
    return this.dialog.open(CourrierPopupComponent, config);

  }

  /**
   * Fonction qui permet d'ouvrir courrier en mode de modification
   * @param courrier 
   */
  readCourrier(courrier: Courrier) {
    let url;
    if (courrier.urlOffice) {
      url = courrier.urlOffice;
      window.open(url, '_self')
    }
  }


}
