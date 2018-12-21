import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatRadioChange, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { Critere, Settings } from 'app/pages/dossiers/recherche-dossier/recherche-dossier.interface';
import { CheckboxCellComponent } from 'app/pages/dossiers/validate-dossier/checkboxCell/checkboxCell.component';
import { GenericVariables } from 'app/shared/generic.variables';
import { SelectionLibelleComponent } from 'app/shared/selection-libelle-component/selection-libelle-component';
import {
  afficherErreur,
  afficherMessageValide,
  getErrorMessage,
  noDataMessage,
  snackbarConfigError,
} from 'app/shared/shared.retourApi';
import { LocalDataSource } from 'ng2-smart-table/lib/data-source/local/local.data-source';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SpinnerLuncher } from '../../../shared/methodes-generiques';
import { EnumActionDossier } from '../dossier/enumeration/enumerations';
import { Dossier } from '../dossiers.interface';


@Component({
  selector: 'siga-attribuer-aides',
  templateUrl: './attribuer-aides.component.html',
  styleUrls: ['./attribuer-aides.component.scss']
})
export class AttribuerAidesComponent extends GenericVariables implements OnInit, OnDestroy {
  /**
* Source to be displayed in the table
*/
  source: LocalDataSource = new LocalDataSource();
  /**
 * Source to be displayed in the tableTotal
 */
  sourceTotals: LocalDataSource = new LocalDataSource();
  sourceTotalsSelectded: LocalDataSource = new LocalDataSource();
  query = '';

  /**
 * check Dossiers in table
 */
  checkAll = true;
  noCheckedDossier = false;
  checkIsClicked = false;

  private unsubscribe = new Subject<void>();

  dossiersDatasForAllCheked: Dossier[] = [];
  dossiersDatasForNoOneCheked: Dossier[] = [];

  nombreTotalResultats = 0;
  nombreTotalSelectionnees = 0;
  summeTotalList = [{ total: '', totalMontant: 0 }]
  summeTotalListSelectionne = [{ total: '', totalMontantSelectionnee: 0 }]

  dateAttributionNotExist = true;
  dateAttribution = null;
  dateAttributionUpdated = null;
  newAttributionDate = null;

  /**
  * Define structure of table (column and style)
 */
  settings: Settings = {
    actions: false,
    noDataMessage,
    hideSubHeader: true,
    columns:
    {
      checked: {
        title: '',
        type: 'custom',
        renderComponent: CheckboxCellComponent,
        onComponentInitFunction: (instance) => {
          instance.editApplicationEvent.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
            this.checkIsClicked = true;
            this.nombreTotalSelectionnees = this.nombreTotalResultats - this.getIdsOfCheckedDossiers(false).length
            this.atLeastOneCheckedDossier();
            if (this.getIdsOfCheckedDossiers(true).length === this.dossiersDatas.length) {
              this.checkAll = true;
            }
            if (this.getIdsOfCheckedDossiers(true).length === 0) {
              this.checkAll = false;
            }
          })
        },
        width: '4%',
        filter: false,
      },
      numeroDossier: {
        title: 'Numéro dossier',
        type: 'custom',
        // component généric sur l'intitulé avec un click programmé
        renderComponent: SelectionLibelleComponent,
        onComponentInitFunction: (instance) => {
          instance.editApplicationEvent.subscribe(row => {
            this.onTableRowClick(row);
          });
        },
        filter: false,
        width: '120px'
      },
      beneficiaire: {
        title: 'Bénéficiaire',
        type: 'html',
        filter: false,
        width: '400px',
        valuePrepareFunction: (cell: any, row: any) => {
          return `<div class="util-left"> ${row.beneficiaire.raisonSociale} </div>`;
        }
      },
      phase: {
        title: 'Phase',
        type: 'html',
        filter: false,
        width: '25%',
        valuePrepareFunction: (cell: any, row: any) => {
          return `<div class="util-right" >${row.phase}</div>`;
        }
      }
    },
    pager: {
      display: false
    }
  };
  /**
   *
   * @param _dossierService
   * @param router
   * @param _snackBar
   * @param _changeDetector
   */
  constructor(
    private _dossierService: DossierService,
    public router: Router,
    private _snackBar: MatSnackBar,
    private _changeDetector: ChangeDetectorRef,
    private spinnerLuncher: SpinnerLuncher) { super() }

  ngOnInit() {
    // store current and previous page
    if (this._dossierService.previousPage === '') {
      this._dossierService.previousPage = this.router.url;
    } else {
      this._dossierService.previousPage = this._dossierService.currentPage;
      if (!this._dossierService.currentPage.includes('/dossier')) {
        this._dossierService.formAttribuerAides = null;
        this._dossierService.idsCheckedDossier = [];
        this._dossierService.checkAll = null;

      }
    }
    this._dossierService.currentPage = this.router.url;
    this._dossierService.getSessionDecision()
      .subscribe(sessions => {
        this.sessions = sessions;
      });

    // setTimeout(() => {
    this.thematiques = this._dossierService.getThematiques();
    this.procedureDecisions = this._dossierService.getProcedureDecisions();
    this.phases = this._dossierService.getPhases()
    this.phases = this.phases.filter(phase => phase.code === 'A01' || phase.code === 'A02')
    // }, this._dossierService.delay);
  }
  /**
   * get the corresponding dossiers for the search
   * @param criteresRecherche Object containing the various parameters by which done the search
   */
  fetchResultatRecherche(criteresRecherche: Critere) {
    this.submitted = true;

    this.currentCriteres = criteresRecherche;
    this._dossierService.getResultatRecherche(criteresRecherche)
      .subscribe(
        (data) => {
          if (this._dossierService.checkAll != null) {
            this.checkAll = this._dossierService.checkAll;
          } else {
            this.checkAll = true;
          }

          let checkStatusForAllDossiers = this._dossierService.idsCheckedDossier.length > 0 ? false : true;
          if (!this.checkAll) {
            checkStatusForAllDossiers = false;
          }
          this.changeCheckedAttributeForAllDossiers(data.dossiers, checkStatusForAllDossiers);
          this.checkDossiersByIds(data.dossiers, this._dossierService.idsCheckedDossier, true);
          this.dossiersDatas = data.dossiers;
          this.dossiersDatasForAllCheked = data.dossiers;
          if (this._dossierService.checkAll != null) {
            this.checkAll = this._dossierService.checkAll;
          }

          this.loadDataSource();
          // Calcul total of result
          this.nombreTotalResultats = data.dossiers.length;
          this.nombreTotalSelectionnees = this.getIdsOfCheckedDossiers(true).length;
          this.atLeastOneCheckedDossier();
          this.submitted = false;
          this.spinnerLuncher.hide();
        },
        (error: HttpErrorResponse) => {
          this.spinnerLuncher.hide();
          const snackMessage = getErrorMessage(error, `La recherche de dossiers a échoué. Contacter l'administrateur.`);
          const snackbarRef = this._snackBar.open(snackMessage, 'X', snackbarConfigError);
          snackbarRef.afterDismissed()
            .subscribe(() => {
              this.submitted = false;
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
    this.sourceTotalsSelectded.load(this.summeTotalListSelectionne);
    this.searchDone = true;
  }

  /**check or uncheck dossiers by thier ids
  * @param dossiers dossiers it's a result of search
  * @param ids all ids of a checked dossiers
  * @param check true if we have devalidate, if validate false
  */
  checkDossiersByIds(dossiers: Dossier[], ids: Array<number>, check: boolean): void {
    ids.forEach(id => {
      dossiers.forEach(dossier => {
        if (dossier.id === id) {
          dossier.checked = check;
          return;
        }
      });
    });
  }

  changeCheckedAttributeForAllDossiers(dossiers: Dossier[], check): void {
    dossiers.forEach(dossier => {
      dossier.checked = check;
    });
  }

  getIdsOfCheckedDossiers(check): Array<number> {
    const idsCheckedDossiers = [];
    this.dossiersDatas.forEach(dossier => {
      if (dossier.checked === check) {
        idsCheckedDossiers.push(dossier.id);
      }
    })
    return idsCheckedDossiers;
  }

  atLeastOneCheckedDossier() {
    let noDossierChecked = true;
    this.dossiersDatas.forEach(dossier => {
      if (dossier.checked) {
        noDossierChecked = false;
        return;
      }
    })
    this.noCheckedDossier = noDossierChecked;
  }

  /**
   * Manages the user selection for a given row
   * @param row the row selected with its data
   */
  onTableRowClick(row: any) {
    this._dossierService.idsCheckedDossier = this.getIdsOfCheckedDossiers(true);
    this._dossierService.checkAll = this.checkAll;
    this.router.navigate([`dossier/${row.id}`]);
  }
  /**
* check all dossiers depending on select all checkbox value
*/
  onCheckBoxChange(event: MatRadioChange) {
    this.checkAll = !this.checkAll;
    if (this.checkAll) {
      this.nombreTotalSelectionnees = this.nombreTotalResultats;
    } else {
      this.nombreTotalSelectionnees = 0;
    }
    this.changeCheckedAttributeForAllDossiers(this.dossiersDatas, this.checkAll);
    this.atLeastOneCheckedDossier();
    this.loadDataSource();
  }
  changeDateAttribution(value) {
    if (value) {
      this.dateAttribution = value;
      this.dateAttributionNotExist = false;
    } else {
      this.dateAttributionNotExist = true;
    }
  }

  attribuerAide() {

    this.spinnerLuncher.show();
    this.submitted = true;
    this.dossierAction = {
      dateAttributionAide: this.dateAttribution ? this.dateAttribution._d : null,
      ids: this.getIdsOfCheckedDossiers(true),
      action: EnumActionDossier.ATTRIBUER_AIDE
    }
    this._dossierService.bascValidDevalid(this.dossierAction)
      .subscribe(
        (data) => {
          if (data) {
            afficherMessageValide(`L'attribution des aides a été effectuée`, this._snackBar, this.submitted, this._changeDetector);
            this.submitted = false; this.fetchResultatRecherche(this.currentCriteres);
            this.newAttributionDate = data;
          }
          this.spinnerLuncher.hide();
        },
        (error: HttpErrorResponse) => {
          this.spinnerLuncher.hide();
          afficherErreur(error, `La validation de dossiers a échoué. Contacter l'administrateur.`, this._snackBar, this._changeDetector);
          this.submitted = false;
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
