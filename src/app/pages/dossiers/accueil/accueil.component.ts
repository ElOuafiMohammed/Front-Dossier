import { SelectionModel } from '@angular/cdk/collections';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar, MatTableDataSource } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AccueilService } from 'app/pages/dossiers/accueil/accueil.service';
import { Dossier } from 'app/pages/dossiers/dossiers.interface';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { CritereRemarque } from 'app/pages/dossiers/recherche-dossier/recherche-dossier.interface';
import { getErrorMessage, snackbarConfigError } from 'app/shared/shared.retourApi';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Utilisateur } from './accueil.interface';


@Component({
  selector: 'siga-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss'],
})


export class AccueilComponent implements OnInit, OnDestroy {
  utilisateurConnecte: Utilisateur;
  utilisateurConnecteNomPrenom: string;
  connected = false;
  prefixTitre = 0;
  prefixTitreNotResponse = 0;
  prefixTitreResponse = 0;

  /**
 * Source to be displayed in the table
 */
  mouseIsOver = false;
  query = '';
  private unsubscribe = new Subject<void>();
  /**
   * Define structure of table (column and style)
  */
  displayedColumns: string[] = ['numDossier', 'beneficiaire', 'intitule', 'phase'];
  displayedColumnsNotResponse: string[] = ['numDossier', 'beneficiaire', 'intitule', 'phase'];
  displayedColumnsResponse: string[] = ['lu', 'numDossier', 'beneficiaire', 'intitule', 'phase', 'archive'];

  /**
   * List of dossiers
   */
  dossiersDatas: Dossier[] = [];
  dossiersDatasNotResponses: Dossier[] = [];
  dataSource = new MatTableDataSource(this.dossiersDatas);
  dataSourceNotResponse = new MatTableDataSource(this.dossiersDatasNotResponses)
  dossiersDatasResponse: Dossier[] = [];
  dossiersDatasResponses = new MatTableDataSource(this.dossiersDatasResponse);;
  selectedRowIndex = -1;

  selection = new SelectionModel<Dossier>(true, []);
  /**
   * Component dependencies
   * @param _router handle manual navigation
   * @param _dossierService used to manage dossiers
   * @param _accueilService used to manage authentification
   * @param _snackBar used to display snackbars
   * @param _changeDetector  triggers Angular change detection
   */
  constructor(
    public _router: Router,
    private _dossierService: DossierService,
    private _accueilService: AccueilService,
    private _snackBar: MatSnackBar,
    private _changeDetector: ChangeDetectorRef,
    private translate: TranslateService
  ) {

    // SIGA-679 : authentification
    try {
      this._accueilService.getUtilisateurConnecte()
        .subscribe(utilisateurConnecte => {
          this.utilisateurConnecte = utilisateurConnecte;
          const emptyString = ' ';
          this.utilisateurConnecteNomPrenom = utilisateurConnecte.prenom + emptyString + utilisateurConnecte.nom;
          this.connected = true;
          /* -------------------------------PREMIER TABLEAU---------------------------------------    */
          const critereToSend: CritereRemarque = this.createCriterea('toTrait');
          this.getResult(critereToSend, 'toTrait');

          /* -------------------------------DEUXIEME TABLEAU---------------------------------------    */
          const critereNotResponse: CritereRemarque = this.createCriterea('notResponse');
          this.getResult(critereNotResponse, 'notResponse');

          /* -------------------------------TROIXIEME TABLEAU---------------------------------------    */

          const critereResponse: CritereRemarque = this.createCriterea('response');
          this.getResult(critereResponse, 'response');
          window.localStorage.setItem('userName', utilisateurConnecte.login);
          window.localStorage.setItem('connecte', this.connected.toString());
        },
          error => {
            if (error.status === '403' || error.status === '0') {
              this.connected = false;
              window.localStorage.setItem('connecte', this.connected.toString());
            }
          });

    } catch (error) {
    }
  }
  /**
   * Initialize the specific inputs
   */
  ngOnInit() {
    // store current and previous page
    if (this._dossierService.previousPage === '') {
      this._dossierService.previousPage = this._router.url;
    } else {
      this._dossierService.previousPage = this._dossierService.currentPage;
    }
    this._dossierService.currentPage = this._router.url;

  }

  /**
   * 
   * @param criteresRecherche 
   * @param typeOfList 
   */
  getResult(criteresRecherche: CritereRemarque, typeOfList: string) {

    this._dossierService.getResultsResearchRemark(criteresRecherche)
      .subscribe(
        (data) => {
          switch (typeOfList) {
            case 'toTrait':
              this.loadDataSource(data.dossiers);
              break;
            case 'notResponse':
              this.loadDataSourceNotResponse(data.dossiers);
              break;
            case 'response':
              this.loadDataSourceResponse(data.dossiers);
              break;
            default: break;
          }
        },
        (error: HttpErrorResponse) => {
          const snackMessage = getErrorMessage(error, `La recherche de dossiers a échoué. Contacter l'administrateur.`);
          const snackbarRef = this._snackBar.open(snackMessage, 'X', snackbarConfigError);
          snackbarRef.afterDismissed().pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
              this._changeDetector.detectChanges();
            });
        });
  }




  /**
   *Load the data in the results table
   */
  loadDataSource(data: Dossier[]): void {
    this.dossiersDatas = data;
    this.prefixTitre = data.length;
    this.dataSource = new MatTableDataSource(data);
  }

  loadDataSourceNotResponse(data: Dossier[]): void {
    this.dossiersDatasNotResponses = data;
    this.prefixTitreNotResponse = data.length;
    this.dataSourceNotResponse = new MatTableDataSource(data);
  }

  loadDataSourceResponse(data: Dossier[]): void {
    this.dossiersDatasResponse = data;
    this.prefixTitreResponse = data.length;
    this.dossiersDatasResponses = new MatTableDataSource(data);
  }
  /**
   * Manages the user selection for a given row
   * @param row the row selected with its data
   */
  onTableRowClick(row: any) {
    // Redirect to update dossier
    this._router.navigate([`dossier/${row.id}`]);
  }
  /**
   * Note row is read
   * @param row 
   * @param event 
   */
  rowChecked(row: Dossier, event: any) {
    const critereLu: CritereRemarque = this.createCriterea('lu', row, event.checked);
    this._dossierService.updateDossierLu(critereLu).subscribe((response: any) => {
      if (response) {
        const critereResponse: CritereRemarque = this.createCriterea('response');
        this.getResult(critereResponse, 'response')
      }
    })
  }
  /**
   * Archive the row. it is not display
   * @param row 
   */
  archiver(row: Dossier) {
    const critereLu: CritereRemarque = this.createCriterea('archive', row, true);
    this._dossierService.updateDossierLu(critereLu).subscribe((value: any) => {
      if (value) {
        const critereResponse: CritereRemarque = this.createCriterea('response');
        this.getResult(critereResponse, 'response');
      }
    })
  }

  /**
   * WHen we mouseover the row 
   * @param row 
   */
  highlight(row: Dossier) {
    this.selectedRowIndex = row.id;

  }
  /**
   * WHen we out mouse the row 
   */
  notHighlight() {
    this.selectedRowIndex = null;
  }
  /**
   * Build creteria 
   * @param typeOfResearch 
   * @param row 
   * @param read 
   * @param archive 
   */
  createCriterea(typeOfResearch: string, row?: Dossier, read?: boolean, archive?: boolean): CritereRemarque {
    switch (typeOfResearch) {
      case 'toTrait':
        return {
          loginDestinataire: this.utilisateurConnecte ? this.utilisateurConnecte.login : window.localStorage.getItem('userName'),
          loginEmetteur: null,
          repondu: false,
          archive: false,
          nbElemPerPage: 100000,
        };
      case 'notResponse':
        return {
          loginDestinataire: null,
          loginEmetteur: this.utilisateurConnecte ? this.utilisateurConnecte.login : window.localStorage.getItem('userName'),
          repondu: false,
          archive: false,
          nbElemPerPage: 100000,
        };
      case 'response':
        return {
          loginDestinataire: null,
          loginEmetteur: this.utilisateurConnecte ? this.utilisateurConnecte.login : window.localStorage.getItem('userName'),
          repondu: true,
          archive: false,
          nbElemPerPage: 100000,
        }
      case 'lu':
        return {
          idDossier: row.id,
          emetteur: this.utilisateurConnecte ? this.utilisateurConnecte.login : window.localStorage.getItem('userName'),
          lu: read,
          archive: false
        };
      case 'archive':
        return {
          idDossier: row.id,
          emetteur: this.utilisateurConnecte ? this.utilisateurConnecte.login : window.localStorage.getItem('userName'),
          lu: false,
          archive: true
        }
      default: break;
    }

  }

  /**
  * Destroys pending subscriptions
  */
  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe.next();
      this.unsubscribe.complete();
    }
  }
}
