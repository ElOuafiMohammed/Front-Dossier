import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { Dossier } from 'app/pages/dossiers/dossiers.interface';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { DossierPrevGestion } from 'app/pages/dossiers/gerer-prevesionnel-dossier/gerer-previsionnelle.component.interface';
import { SelectComponent } from 'app/pages/dossiers/gerer-prevesionnel-dossier/priorite-input/select.component';
import {
  SelectSessionComponent,
} from 'app/pages/dossiers/gerer-prevesionnel-dossier/session-input/select-session.component';
import { Critere, Settings } from 'app/pages/dossiers/recherche-dossier/recherche-dossier.interface';
import { ConfirmPopupComponent } from 'app/shared/confirm-popup/confirm-popup.component';
import { GenericVariables } from 'app/shared/generic.variables';
import { SelectionLibelleComponent } from 'app/shared/selection-libelle-component/selection-libelle-component';
import { getErrorMessage, noDataMessage, snackbarConfigError, snackbarConfigSuccess } from 'app/shared/shared.retourApi';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';
import { LocalDataSource } from 'ng2-smart-table/lib/data-source/local/local.data-source';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { SpinnerLuncher } from '../../../shared/methodes-generiques';
import { BenefciaireComponent } from './benefciaire/benefciaire.component';
import { IntituleComponent } from './intitule/intitule.component';



@Component({
  selector: 'siga-search-table-gerer-previsionnelle',
  templateUrl: './gerer-previsionnelle.component.html',
  styleUrls: ['./gerer-previsionnelle.component.scss'],
})

export class GererPrevisionnelleComponent extends GenericVariables implements OnInit, OnDestroy {
  /**
  * Source to be displayed in the table
  */
  source: LocalDataSource = new LocalDataSource();
  /**
* Source to be displayed in the tableTotal
*/
  sourceTotals: LocalDataSource = new LocalDataSource();

  updatedDossier: DossierPrevGestion[] = [];
  /**
   * Define structure of table (column and style)
  */
  settings: Settings = {
    actions: false,
    noDataMessage,
    hideSubHeader: true,
    columns:
    {
      numeroDossier: {
        title: 'Numéro',
        type: 'custom',
        width: '6%',
        renderComponent: SelectionLibelleComponent,
        onComponentInitFunction: (instance) => {
          instance.editApplicationEvent.subscribe(row => {
            this.onTableRowClick(row);
          });
        },
        filter: false
      },
      phase: {
        title: 'Phase',
        type: 'txt',
        filter: false,
        width: '5%',
      },

      beneficiaire: {
        title: 'Bénéficiaire',
        type: 'custom',
        filter: false,
        renderComponent: BenefciaireComponent,
        width: '22%'
      },
      intitule: {
        title: 'Intitulé',
        type: 'custom',
        filter: false,
        renderComponent: IntituleComponent,
        width: '20%'
      },
      sessionDecisionPrevi: {
        title: 'Année Session',
        type: 'custom',
        renderComponent: SelectSessionComponent,
        onComponentInitFunction: (instance) => {
          instance.sessions = this.sessions;
          instance.editApplicationEventSelect.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
            this.onEditSelectEvent(value);
          });
        },
        filter: false,
        addable: false,
        width: '20%'
      },
      priorite: {
        title: 'Priorité',
        type: 'custom',
        renderComponent: SelectComponent,
        onComponentInitFunction: (instance) => {
          instance.priorites = this.priorites;
          instance.editApplicationEventSelect.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
            this.onEditSelectEvent(value);
          })
        },
        width: '5%',
        filter: false,
        addable: false,
      },
      totalMontantAide: {
        title: 'Total (€)',
        type: 'html',
        filter: false,
        width: '16%',
        valuePrepareFunction: (cell: any, row: any) => {
          let transformedValue = '0';
          if (row.totalMontantAide) {
            transformedValue = this.formatMonetairePipe.transform(row.totalMontantAide);
          }

          return `<div>${transformedValue}</div>`;
        }
      }
    },
    pager: {
      display: false
    }
  };

  /*
 * Define structure of table (one Row totals)
*/
  settingsTotals: Settings = {
    actions: false,
    hideSubHeader: true,
    columns: {
      vide: {
        type: 'html',
        width: '4%',
        filter: false,
        addable: false,
        valuePrepareFunction: () => {
          return '';
        }
      },
      total: {
        type: 'html',
        width: '50px',
        filter: false,
        addable: false,
        valuePrepareFunction: () => {
          return `<strong class="util-right"> Total aides </strong>`;
        }
      },
      totalMontant: {
        type: 'html',
        filter: false,
        width: '16%',
        valuePrepareFunction: (cell: any, row: any) => {
          let transformedValue = '0';
          if (row.totalMontant) {
            transformedValue = this.formatMonetairePipe.transform(row.totalMontant);
          }
          return `<div  class="util-right montant-op-recap-align-total">${transformedValue}</div>`;
        }
      }
    }

  };

  /**
   * Configuration actuelle
   */
  currentCriteres: Critere
  listRows: Dossier[] = [];

  valueCloseDialog = false;
  errorOnYear = false;

  searchClicked = false;

  private unsubscribe = new Subject<void>();
  summeTotalList = [{ total: '', totalMontant: 0 }]
  /**
   * Component dependencies
   * @param _dossierService used to manage dossiers
   * @param _snackBar used to display snackbars
   * @param router handle manual navigation
   * @param _changeDetector triggers Angular change detection
   */
  constructor(
    private _dossierService: DossierService,
    private _snackBar: MatSnackBar,
    public router: Router,
    public dialog: MatDialog,
    public formatMonetairePipe: FormatMonetairePipe,
    private _changeDetector: ChangeDetectorRef,
    private spinnerLuncher: SpinnerLuncher
  ) {
    super()
  }

  /**
   * Initialize the specific inputs
   */

  ngOnInit() {

    // store current and previous page
    if (this._dossierService.previousPage === '') {
      this._dossierService.previousPage = this.router.url;
    } else {
      this._dossierService.previousPage = this._dossierService.currentPage;
      if (!this._dossierService.currentPage.includes('/dossier')) {
        this._dossierService.formPrevGestion = null;
        this._dossierService.idsCheckedDossier = [];
        this._dossierService.checkAll = null;

      }
    }
    this._dossierService.currentPage = this.router.url;

    this._dossierService.getSessionPrevisionnel()
      .subscribe(sessions => {
        this.sessions = sessions.filter(session => { return session.type === 'CI' });
      });

    //  setTimeout(() => {

    this.thematiques = this._dossierService.getThematiques();
    this.phases = this._dossierService.getPhases().filter(session => {
      if (session.code === 'P00' || session.code === 'P10' || session.code === 'P20' || session.code === 'T10') {
        return session;
      }
    });
    this.priorites = this._dossierService.getNiveauPriorite();

    // }, this._dossierService.delay);

  }

  search(criteresRecherche: Critere) {
    this.currentCriteres = criteresRecherche;
    this.searchClicked = true;
    if (this.updatedDossier.length > 0) {
      this.canDeactivate();
    } else {
      this.fetchResultatRecherche(this.currentCriteres);
    }

  }

  /**
   * get the corresponding dossiers for the search
   * @param criteresRecherche Object containing the various parameters by which done the search
   */
  fetchResultatRecherche(criteresRecherche: Critere) {
    this.submitted = true;
    this._dossierService.getResultatRecherche(criteresRecherche)
      .subscribe(
        (data) => {
          this.dossiersDatas = data.dossiers;
          this.summeTotalList[0].totalMontant = this.calculeSummeAide(this.dossiersDatas);
          this.loadDataSource();
          this.submitted = false;
          this.searchClicked = false;
          this.updatedDossier = [];
          this.spinnerLuncher.hide();
        },
        (error: HttpErrorResponse) => {
          this.spinnerLuncher.show();
          const snackMessage = getErrorMessage(error, `La recherche de dossiers a échoué. Contacter l'administrateur.`);
          const snackbarRef = this._snackBar.open(snackMessage, 'X', snackbarConfigError);
          snackbarRef.afterDismissed()
            .subscribe(() => {
              this.submitted = false;
              this.searchClicked = false;
              this._changeDetector.detectChanges();
            });
        });
  }

  /**
   *Load the data in the results table
   */
  loadDataSource(): void {
    this.source.load(this.dossiersDatas);
    this.sourceTotals.load(this.summeTotalList);
    this.searchDone = true;
  }

  /**
   * Manages the user selection for a given row
   * @param row the row selected with its data
   */
  onTableRowClick(row: any) {
    this.router.navigate([`dossier/${row.id}`]);
  }

  calculeSummeAide(dossiers: Dossier[]): number {
    let summe = 0;
    dossiers.forEach(dossier => {
      summe += dossier.totalMontantAide;
    })
    return summe;
  }

  onEditSelectEvent(rowData: any) {
    let found = false;
    this.updatedDossier.forEach(updatedDossier => {
      if (rowData.id === updatedDossier.id) {
        updatedDossier.idPriorite = rowData.priorite ? rowData.priorite.id : null;
        updatedDossier.idSessionDecisionPrevi = rowData.sessionDecisionPrevi ? rowData.sessionDecisionPrevi.id : null;
        updatedDossier.anneeEngagPrevi = rowData.anneeEngagPrevi;
        found = true;
      }
    })
    if (!found) {
      const newUpdatedDossier: DossierPrevGestion = {
        id: rowData.id,
        anneeEngagPrevi: rowData.anneeEngagPrevi,
        idPriorite: rowData.priorite ? rowData.priorite.id : null,
        idSessionDecisionPrevi: rowData.sessionDecisionPrevi ? rowData.sessionDecisionPrevi.id : null
      }
      this.updatedDossier.push(newUpdatedDossier);
    }
    this.errorOnYear = this.checkRowHasError(this.updatedDossier);
  }

  checkRowHasError(listDosPrev: any): boolean {
    let retour = false;
    listDosPrev.forEach(dosPrev => {
      const annee = dosPrev.anneeEngagPrevi;
      if (annee && annee.toString().length === 4 && annee < 1950) {
        retour = true;
      }
      if (annee && annee.toString().length === 4 && annee < new Date().getFullYear()) {
        retour = true;
      }
      if (annee && annee.toString().length === 4 && annee > 2050) {
        retour = true;
      }
      if (annee && annee.toString().length < 4) {
        retour = true;
      }
      if (annee && annee.toString().length > 4) {
        retour = true;
      }

    });
    return retour;
  }

  /**
   * Implements the guard canDeactivate() logic to being redirected
   */
  canDeactivate(): Observable<boolean> | boolean {
    if (this.updatedDossier.length > 0) {
      return this.openConfirmDialog()
        .beforeClose().pipe(
          map((dialogResult) => {
            if (dialogResult === 'save') {
              dialogResult = true;
            }
            return dialogResult as boolean;
          }));
    }
    return true;
  }

  /**
   * Configures OK / KO Material Dialog and returns the reference
   */
  openConfirmDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    const myDialog = this.dialog.open(ConfirmPopupComponent, {
      data: {
        valueStatusError: false,
        // typeAction: this.searchClicked ? 'naturePagination' : 'update'
        typeAction: 'update'
      }
    });
    myDialog.afterClosed().subscribe(result => {
      if (result === 'save') {
        this.submit();
        this.valueCloseDialog = true;
      } else if (result === true) {
        this.valueCloseDialog = true;
        if (this.searchClicked) {
          this.fetchResultatRecherche(this.currentCriteres);
        }
      } else if (result === false) {
        this.valueCloseDialog = false;
        this.searchClicked = false;
        this.submitted = true;
        setTimeout(() => {
          this.submitted = false;
        }, 50);
      }
    });
    return myDialog;
  }

  /**
   * submit  updated dossiers
   */
  submit() {
    this.spinnerLuncher.show();
    this.submitted = true;
    this._dossierService.saveGestionPrev(this.updatedDossier)
      .subscribe(
        (data) => {
          this._snackBar.open(`Les dossiers ont bien été modifiés`, 'X', snackbarConfigSuccess);
          this.submitted = false;
          this.fetchResultatRecherche(this.currentCriteres);
          this.updatedDossier = [];
          this.spinnerLuncher.hide();
        },
        (error: HttpErrorResponse) => {
          this.threwError(error);
          this.spinnerLuncher.hide();
        });
  }
  private threwError(error: HttpErrorResponse) {
    const snackMessage = getErrorMessage(error, `La recherche de dossiers a échoué. Contacter l'administrateur.`);
    const snackbarRef = this._snackBar.open(snackMessage, 'X', snackbarConfigError);
    snackbarRef.afterDismissed().pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.submitted = false;
        this.searchClicked = false;
        this._changeDetector.detectChanges();
      });
  }

  /**
  * Destroys pending subscriptions
  */
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();

  }
}
