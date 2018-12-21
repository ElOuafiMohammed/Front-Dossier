import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatRadioChange, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { DossierAction } from 'app/pages/dossiers/dossier/dossier.interface';
import { Dossier } from 'app/pages/dossiers/dossiers.interface';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { Critere, Settings } from 'app/pages/dossiers/recherche-dossier/recherche-dossier.interface';
import { CheckboxCellComponent } from 'app/pages/dossiers/validate-dossier/checkboxCell/checkboxCell.component';
import { GenericVariables } from 'app/shared/generic.variables';
import { SelectionLibelleComponent } from 'app/shared/selection-libelle-component/selection-libelle-component';
import { getErrorMessage, noDataMessage, snackbarConfigError, snackbarConfigSuccess } from 'app/shared/shared.retourApi';
import { LocalDataSource } from 'ng2-smart-table/lib/data-source/local/local.data-source';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { SpinnerLuncher } from '../../../shared/methodes-generiques';
import { EnumActionDossier } from '../dossier/enumeration/enumerations';
import { BenefciaireValidateComponent } from '../validate-dossier/benefciaire/benefciaire.component';

@Component({
  selector: 'siga-search-table-recherche-rl-sga',
  templateUrl: './validate-rl-sga-dossier.component.html',
  styleUrls: ['./validate-rl-sga-dossier.component.scss'],
})

export class ValidateRlSgaDossierComponent extends GenericVariables implements OnInit, OnDestroy {
  /**
  * Source to be displayed in the table
  */
  source: LocalDataSource = new LocalDataSource();
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
            // count the number of the selectioned dossier
            this.nombreTotalSelectionnees = this.dossiersDatas.filter(dossier => dossier.beneficiaire.actif === true).length - this.getIdsOfCheckedDossiers(false).length
            this.atLeastOneCheckedDossier();
            if (this.getIdsOfCheckedDossiers(true).length === this.dossiersDatas.filter(dossier => dossier.beneficiaire.actif === true).length) {
              this.checkAll = true;
            }
            if (this.getIdsOfCheckedDossiers(true).length === 0) {
              this.checkAll = false;
              this.benefInactif = true
            } else {
              this.benefInactif = false
            }
          })

          instance.editApplicationEvent.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
            this.checkIsClicked = true;
            // count the number of the selectioned dossier
            this.nombreTotalSelectionnees = this.dossiersDatas.filter(dossier => dossier.beneficiaire.actif === true).length - this.getIdsOfCheckedDossiers(false).length
            this.atLeastOneCheckedDossier();
            if (this.getIdsOfCheckedDossiers(true).length === this.dossiersDatas.length) {
              this.checkAll = true;
            }
            if (this.getIdsOfCheckedDossiers(true).length === 0) {
              this.checkAll = false;
              this.benefInactif = true
            } else {
              this.benefInactif = false
            }
          })
        },
        width: '3%',
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
        width: '17%'
      },
      beneficiaire: {
        title: 'Bénéficiaire',
        type: 'custom',
        filter: false,
        width: '30%',
        renderComponent: BenefciaireValidateComponent,
      },
      intitule: {
        title: 'Intitulé',
        type: 'txt',
        filter: false,
        width: '30%'
      },
      valideRl: {
        title: 'RL',
        type: 'html',
        filter: false,
        width: '6%',
        valuePrepareFunction: (cell: any, row: any) => {
          if (row.valideRl) {
            return `    <em class="ion-checkmark siga-form-confirm"></em>`;
          } else {
            return `    <em class="ion-close siga-form-cancel"></em>`;
          }
        }
      },
      valideSga: {
        title: 'SGA',
        type: 'html',
        filter: false,
        width: '6%',
        valuePrepareFunction: (cell: any, row: any) => {
          if (row.valideSga) {
            return `    <em class="ion-checkmark siga-form-confirm"></em>`;
          } else {
            return `    <em class="ion-close siga-form-cancel"></em>`;
          }
        }
      }
    },
    pager: {
      display: false
    }
  };

  noCheckedDossier: Boolean = false;
  /**
   * Used check if user click on a ligne or checkbox button
   */
  checkIsClicked: Boolean = false;
  private unsubscribe = new Subject<void>();

  /**
   * check Dossiers in table
   */
  checkAll: Boolean = true;

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
        this._dossierService.formValidationCritereRlSga = null;
        this._dossierService.idsCheckedDossier = [];
        this._dossierService.checkAll = null;
      }
    }
    this._dossierService.currentPage = this.router.url;

    setTimeout(() => {
      this.thematiques = this._dossierService.getThematiques();
      this.delegations = this._dossierService.getDelegation();
      this.domaines = this._dossierService.getDomaines();
      this.priorites = this._dossierService.getNiveauPriorite();
      this.procedureDecisions = this._dossierService.getProcedureDecisions();

    }, this._dossierService.delay);
  }

  changeAction(dossierAction: DossierAction) {
    this.dossierAction = dossierAction;
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
          this.listBenefInactif = [];
          this.benefInactif = false;
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
    } else {
      this.nombreTotalSelectionnees = 0;
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
  * valide or devalid checked dossiers (phase from T20 to T25 or inverse) and done the query of serach again
  */
  validerDevalider() {
    this.spinnerLuncher.show();
    this.submitted = true;
    const devalider_siege = this.currentCriteres.devaliderSiege;
    this.dossierAction.action = devalider_siege ? EnumActionDossier.DEVALIDER : EnumActionDossier.VALIDER;

    this.dossierAction.ids = this.getIdsOfCheckedDossiers(true);

    let message = '';
    if (!devalider_siege) {
      message = 'Les dossiers sélectionnés ont bien été validés par le ' + this.dossierAction.profil;
    } else {
      message = 'Les dossiers sélectionnés ont bien été dévalidés par le ' + this.dossierAction.profil;
    }

    this._dossierService.bascValidDevalid(this.dossierAction)
      .subscribe(
        (data) => {
          this.spinnerLuncher.hide();
          this._snackBar.open(message, 'X', snackbarConfigSuccess);
          this.fetchResultatRecherche(this.currentCriteres);
        },
        (error: HttpErrorResponse) => {
          this.spinnerLuncher.hide();
          const snackMessage = getErrorMessage(error, `La dévalidation de dossiers a échoué. Contacter l'administrateur.`);
          const snackbarRef = this._snackBar.open(snackMessage, 'X', snackbarConfigError);
          snackbarRef.afterDismissed()
            .subscribe(() => {
              this.submitted = false;
              this._changeDetector.detectChanges();
            });
        });
  }

  getIdsOfCheckedDossiers(check: Boolean): Array<number> {
    const idsCheckedDossiers = [];
    this.dossiersDatas.forEach(dossier => {
      if (dossier.checked === check && dossier.beneficiaire.actif) {
        idsCheckedDossiers.push(dossier.id);
      }
    })
    return idsCheckedDossiers;
  }

  changeCheckedAttributeForAllDossiers(dossiers: Dossier[], check: Boolean): void {
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

  /**
  * Destroys pending subscriptions
  */
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
