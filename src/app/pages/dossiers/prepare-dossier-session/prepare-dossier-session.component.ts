import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatRadioChange, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { NatureOperation, SessionDecision } from 'app/pages/dossiers/dossier/dossier.interface';
import { Dossier } from 'app/pages/dossiers/dossiers.interface';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { Critere, Settings } from 'app/pages/dossiers/recherche-dossier/recherche-dossier.interface';
import { CheckboxCellComponent } from 'app/pages/dossiers/validate-dossier/checkboxCell/checkboxCell.component';
import { GenericVariables } from 'app/shared/generic.variables';
import { SelectionLibelleComponent } from 'app/shared/selection-libelle-component/selection-libelle-component';
import { getErrorMessage, noDataMessage, snackbarConfigError, snackbarConfigSuccess } from 'app/shared/shared.retourApi';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';
import { LocalDataSource } from 'ng2-smart-table/lib/data-source/local/local.data-source';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { SpinnerLuncher } from '../../../shared/methodes-generiques';
import { EnumActionDossier } from '../dossier/enumeration/enumerations';
import { BenefciaireValidateComponent } from '../validate-dossier/benefciaire/benefciaire.component';

@Component({
  selector: 'siga-search-table-recherche-affectation',
  templateUrl: './prepare-dossier-session.component.html',
  styleUrls: ['./prepare-dossier-session.component.scss'],
})

export class PrepareDossierSessionComponent extends GenericVariables implements OnInit, OnDestroy {
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
  nombreTotalResultats = 0;
  nombreTotalSelectionnees = 0;
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
            this.calculeSummeAideSelectionnee(this.dossiersDatas);
            this.nombreTotalSelectionnees = this.dossiersDatas.filter(dossier => dossier.beneficiaire.actif === true).length - this.getIdsOfCheckedDossiers(false).length
            this.atLeastOneCheckedDossier();
            if (this.getIdsOfCheckedDossiers(true).length === this.dossiersDatas.filter(dossier => dossier.beneficiaire.actif === true).length) {
              this.checkAll = true;
              this.benefInactif = true

            }
            if (this.getIdsOfCheckedDossiers(true).length === 0) {
              this.checkAll = false;
              this.benefInactif = true;
              this.atLeastOneCheckedDossier();
              this.summeTotalListSelectionne = [{ total: '', totalMontantSelectionnee: 0 }];
            } else {
              this.benefInactif = false
            }
          })
        },
        width: '5%',
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
        width: '15%'
      },
      intitule: {
        title: 'Intitulé',
        type: 'txt',
        filter: false,
        width: '30%'
      },
      beneficiaire: {
        title: 'Bénéficiaire',
        type: 'custom',
        filter: false,
        width: '35%',
        renderComponent: BenefciaireValidateComponent,
      },
      totalMontantAide: {
        title: 'Total montant aide (€)',
        type: 'html',
        filter: false,
        width: '15%',
        valuePrepareFunction: (cell: any, row: any) => {
          let transformedValue = '0';
          if (row.totalMontantAide) {
            transformedValue = this.formatMonetairePipe.transform(row.totalMontantAide);
          }

          return `<div class="util-right" >${transformedValue}</div>`;
        }
      }
    },
    pager: {
      display: false
    }
  };

  currentSession: SessionDecision = null;

  /**
   * Displays the table once a result is available
   */
  searchDone = false;
  natures: NatureOperation[]
  noCheckedDossier: boolean = false;
  /**
  * Used check if user click on a ligne or checkbox button
  */
  checkIsClicked: boolean = false;
  private unsubscribe = new Subject<void>();

  summeTotalList = [{ total: '', totalMontant: 0 }]
  summeTotalListSelectionne = [{ total: '', totalMontantSelectionnee: 0 }]
  /**
   * check Dossiers in table
   */
  checkAll: boolean = true;

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
    public formatMonetairePipe: FormatMonetairePipe,
    private _changeDetector: ChangeDetectorRef,
    private spinnerLuncher: SpinnerLuncher
  ) { super() }

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
        this._dossierService.formCommisonAffectation = null;
        this._dossierService.idsCheckedDossier = [];
        this._dossierService.checkAll = null;
      }
    }
    this._dossierService.currentPage = this.router.url;

    this._dossierService.getNatureOperation(null, null, null, 100000, null)
      .subscribe(data => {
        this.natures = data.natureOperations;
      });
    this._dossierService.getSessionDecision()
      .subscribe(sessions => {
        this.sessions = sessions;
      });

    //  setTimeout(() => {
    this.thematiques = this._dossierService.getThematiques();
    this.domaines = this._dossierService.getDomaines();
    this.priorites = this._dossierService.getNiveauPriorite();
    this.procedureDecisions = this._dossierService.getProcedureDecisions();
    //  }, this._dossierService.delay);

    this.dossierAction = {
      action: EnumActionDossier.AFFECTER_SESSION,
      ids: []
    }
  }

  changeSession(session: SessionDecision) {
    if (session) {
      this.currentSession = session;
    } else {
      this.currentSession = null;
    }
  }

  /**
   * get the corresponding dossiers for the search
   * @param criteresRecherche Object containing the various parameters by which done the search
   */
  fetchResultatRecherche(criteresRecherche: Critere) {
    this.submitted = true;
    this.listBenefInactif = [];
    this.benefInactif = false;
    this.currentCriteres = criteresRecherche;
    this._dossierService.getResultatRecherche(criteresRecherche)
      .subscribe(
        (data) => {
          if (this._dossierService.checkAll != null) {
            this.checkAll = this._dossierService.checkAll;
          } else {
            this.checkAll = true;
          }

          let checkStatusForAllDossiers;
          if (this._dossierService.idsCheckedDossier.length) {
            checkStatusForAllDossiers = false
          } else {
            checkStatusForAllDossiers = true
          }

          if (!this.checkAll) {
            checkStatusForAllDossiers = false;
          }
          this.changeCheckedAttributeForAllDossiers(data.dossiers, checkStatusForAllDossiers);
          this.checkDossiersByIds(data.dossiers, this._dossierService.idsCheckedDossier, true);
          this.dossiersDatas = data.dossiers;
          this.summeTotalList[0].totalMontant = this.calculeSummeAide(this.dossiersDatas);
          this.summeTotalListSelectionne[0].totalMontantSelectionnee = this.calculeSummeAideSelectionnee(this.dossiersDatas);
          if (this._dossierService.checkAll != null) {
            this.checkAll = this._dossierService.checkAll;
          }

          this.loadDataSource();
          data.dossiers.forEach(dossier => {
            if (!dossier.beneficiaire.actif) {
              this.listBenefInactif.push(dossier)
            }
          })
          if (data.dossiers.length === this.listBenefInactif.length) {
            this.benefInactif = true
          }
          // Calcul total of result
          this.nombreTotalResultats = data.dossiers.length
          this.nombreTotalSelectionnees = this.getIdsOfCheckedDossiers(true).length;
          this.atLeastOneCheckedDossier();
          this.submitted = false;
          if (this.spinnerLuncher) {
            this.spinnerLuncher.hide();
          }
        },
        (error: HttpErrorResponse) => {
          if (this.spinnerLuncher) {
            this.spinnerLuncher.hide();
          }
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

  /**
   * Manages the user selection for a given row
   * @param row the row selected with its data
   */
  onTableRowClick(row: any) {
    // give checkbox component time to emit response if there is
    setTimeout(() => {
      // store uncheckedDossierIds
      this._dossierService.idsCheckedDossier = this.getIdsOfCheckedDossiers(true);
      this._dossierService.checkAll = this.checkAll;
      // Redirect to update dossier
      this.router.navigate([`dossier/${row.id}`]);
    }, 50);
  }

  /**
 * check all dossiers depending on select all checkbox value
 */
  onCheckBoxChange(event: MatRadioChange) {
    this.checkAll = !this.checkAll;
    if (this.checkAll) {
      this.nombreTotalSelectionnees = this.dossiersDatas.filter(dossier => dossier.beneficiaire.actif === true).length
      this.summeTotalListSelectionne[0].totalMontantSelectionnee = this.calculeSummeAide(this.dossiersDatas.filter(dossier => dossier.beneficiaire.actif === true));
      // this.calculeSummeAideSelectionnee(this.dossiersDatas);
    } else {
      this.nombreTotalSelectionnees = 0;
      this.summeTotalListSelectionne = [{ total: '', totalMontantSelectionnee: 0 }];
    }
    if (this.nombreTotalSelectionnees === 0) {
      this.benefInactif = true
    } else {
      this.benefInactif = false
    }
    this.changeCheckedAttributeForAllDossiers(this.dossiersDatas, this.checkAll);
    this.atLeastOneCheckedDossier();
    this.loadDataSource();
  }

  /**
* affect or retry checked dossiers to a session (phase from T30 to T35 or inverse) and done the query of serach again
*/
  validerDevalider() {
    if (this.spinnerLuncher) {
      this.spinnerLuncher.show();
    }
    this.submitted = true;
    this.dossierAction.action = this.currentCriteres.phase === 'T30' ? EnumActionDossier.AFFECTER_SESSION : EnumActionDossier.RETIRER_SESSION;
    this.dossierAction.ids = this.getIdsOfCheckedDossiers(true);
    this.dossierAction.idSessionDecision = this.currentSession.id;
    let message = '';
    if (this.dossierAction.action === EnumActionDossier.AFFECTER_SESSION) {
      message = `les dossiers ont été affectés à la session ${this.currentSession.annee} - ${this.currentSession.numero}`;
    } else {
      message = `les dossiers ont été retirés à la session ${this.currentSession.annee} - ${this.currentSession.numero}`;
    }
    this._dossierService.bascValidDevalid(this.dossierAction)
      .subscribe(
        (data) => {
          if (this.spinnerLuncher) {
            this.spinnerLuncher.hide();
          }
          this._snackBar.open(message, 'X', snackbarConfigSuccess);
          this.fetchResultatRecherche(this.currentCriteres);
        },
        (error: HttpErrorResponse) => {
          if (this.spinnerLuncher) {
            this.spinnerLuncher.hide();
          }
          const snackMessage = getErrorMessage(error, `La dévalidation de dossiers a échoué. Contacter l'administrateur.`);
          const snackbarRef = this._snackBar.open(snackMessage, 'X', snackbarConfigError);
          snackbarRef.afterDismissed()
            .subscribe(() => {
              this.submitted = false;
              this._changeDetector.detectChanges();
            });
        });
  }

  getIdsOfCheckedDossiers(check: boolean): Array<number> {
    const idsCheckedDossiers = [];
    this.dossiersDatas.forEach(dossier => {
      if (dossier.checked === check && dossier.beneficiaire.actif) {
        idsCheckedDossiers.push(dossier.id);
      }
    })
    return idsCheckedDossiers;
  }

  changeCheckedAttributeForAllDossiers(dossiers: Dossier[], check: boolean): void {
    dossiers.forEach(dossier => {
      dossier.checked = check;
    });
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

  calculeSummeAide(dossiers: Dossier[]): number {
    let summe = 0;
    dossiers.forEach(dossier => {
      summe += dossier.totalMontantAide;
    })
    return summe;
  }

  calculeSummeAideSelectionnee(dossiers: Dossier[]): number {
    let summe = 0;
    dossiers.forEach(dossier => {
      if (dossier.checked === true && dossier.beneficiaire.actif) {
        summe += dossier.totalMontantAide;
      }
    })
    this.summeTotalListSelectionne[0].totalMontantSelectionnee = summe;
    this.loadDataSource();
    return summe;
  }

  /**
  * Destroys pending subscriptions
  */
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
