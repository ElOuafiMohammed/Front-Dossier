import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { LocalDataSource } from 'ng2-smart-table/lib/data-source/local/local.data-source';
import { Settings, Critere } from 'app/pages/dossiers/recherche-dossier/recherche-dossier.interface';
import { noDataMessage, getErrorMessage, snackbarConfigError, snackbarConfigSuccess } from 'app/shared/shared.retourApi';
import { Dossier } from 'app/pages/dossiers/dossiers.interface';
import { DossierAction } from 'app/pages/dossiers/dossier/dossier.interface';
import { MatSnackBar, MatRadioChange, MatCheckboxChange } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { CheckboxCellComponent } from 'app/pages/dossiers/validate-dossier/checkboxCell/checkboxCell.component';
import { Subject } from 'rxjs/Subject';
import { SelectionLibelleComponent } from 'app/shared/selection-libelle-component/selection-libelle-component';
import { GenericVariables } from 'app/shared/generic.variables';
import { takeUntil } from 'rxjs/operators';
import { BenefciaireValidateComponent } from 'app/pages/dossiers/validate-dossier/benefciaire/benefciaire.component';
import { EnumActionDossier, EnumProfilDossier } from 'app/pages/dossiers/dossier/enumeration/enumerations';
import { DossierDataSource } from 'app/pages/dossiers/saisir-avis/saisir-avis/dossier.dataSource';
import { SpinnerLuncher } from 'app/shared/methodes-generiques';

@Component({
  selector: 'siga-action-table-signer-dossier',
  templateUrl: './signer-dossier.component.html',
  styleUrls: ['./signer-dossier.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class SignerDossierComponent extends GenericVariables implements OnInit, OnDestroy {
  /**
  * Source to be displayed in the table
  */
  dataSource: DossierDataSource;
  /**
 * Columns of table
 */
  displayedColumns = ['checkBox', 'numDossier', 'libelleBenef', 'intitule', 'docAttributif', 'verifRa', 'verifCaa'];
  query = '';
  nombreTotalResultats = 0;
  nombreTotalSelectionnees = 0;

  noCheckedDossier: boolean = false;
  /**
   * Used check if user click on a ligne or checkbox button
   */
  checkIsClicked: boolean = false;
  private unsubscribe = new Subject<void>();

  /**
   * check Dossiers in table
   */
  checkAll: boolean = false;

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
        this._dossierService.formSignerVerifier = null;
        this._dossierService.idsCheckedDossier = [];
        this._dossierService.checkAll = null;
      }
    }
    this._dossierService.currentPage = this.router.url;
    this._dossierService.getSessionDecision()
      .subscribe(sessions => {
        this.sessions = sessions;
      });

    this._dossierService.getDateAttributifs()
      .subscribe(dates => {
        this.dates = dates;
      });

    setTimeout(() => {
      this.thematiques = this._dossierService.getThematiques();
      this._dossierService.getResponsableTech()
        .subscribe(responsablestech => {
          this.responsablesTech = responsablestech;
        });
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
    this.spinnerLuncher.show();
    this.submitted = true;
    this.currentCriteres = criteresRecherche;
    this._dossierService.getResultatRecherche(criteresRecherche)
      .subscribe(
        (data) => {
          this.listBenefInactif = [];
          this.benefInactif = false;
          if (this._dossierService.checkAll != null) {
            this.checkAll = this._dossierService.checkAll;
          }
          this.changeCheckedAttributeForAllDossiers(data.dossiers, false);
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
          const snackMessage = getErrorMessage(error, `La recherche de dossiers a échoué. Contacter l'administrateur.`);
          const snackbarRef = this._snackBar.open(snackMessage, 'X', snackbarConfigError);
          snackbarRef.afterDismissed()
            .subscribe(() => {
              this.submitted = false;
              this._changeDetector.detectChanges();
              this.spinnerLuncher.hide();
            });
        });
  }

  /**
   *Load the data in the results table
   */
  loadDataSource(): void {
    this.dataSource = new DossierDataSource(this.dossiersDatas);
    this.searchDone = true;
  }

  isExpansionMotifDossier = (i: number, row: Object) => row.hasOwnProperty('detailRow');


  onCheckBoxChange(dossier: Dossier, event: MatCheckboxChange) {
    dossier.checked = !dossier.checked;
    this.nombreTotalSelectionnees = this.nombreTotalResultats - this.getIdsOfCheckedDossiers(false).length
    this.atLeastOneCheckedDossier();
    if (this.getIdsOfCheckedDossiers(true).length === this.dossiersDatas.length) {
      this.checkAll = true;
    }
    if (this.getIdsOfCheckedDossiers(true).length === 0) {
      this.checkAll = false;
    }
  }

  /**
 * check all dossiers depending on select all checkbox value
 */
  onCheckBoxChangeTotal(event: MatRadioChange) {
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
  verifierSigner() {
    this.submitted = true;
    const verifier = this.dossierAction.action === EnumActionDossier.VERIFIER_ATTRIB ? true : false;

    this.dossierAction.ids = this.getIdsOfCheckedDossiers(true);

    let message = '';
    if (!verifier) {
      message = 'Les dossiers sélectionnés ont bien été vérifiés par le ' + this.dossierAction.profil;
    } else {
      message = 'Les dossiers sélectionnés ont bien été signés par le ' + this.dossierAction.profil;
    }
    this._dossierService.bascValidDevalid(this.dossierAction)
      .subscribe(
        (data) => {
          this._snackBar.open(message, 'X', snackbarConfigSuccess);
          this.fetchResultatRecherche(this.currentCriteres);
        },
        (error: HttpErrorResponse) => {
          const snackMessage = getErrorMessage(error, `La vérification / singement de dossiers a échoué. Contacter l'administrateur.`);
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

  consultDossier(dossier: Dossier) {
    this._dossierService.idsCheckedDossier = this.getIdsOfCheckedDossiers(true);
    this._dossierService.checkAll = this.checkAll;
    this.router.navigate([`dossier/${dossier.id}`]);
  }

  // change attribut checked for all dossier 
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

  /**
  * Destroys pending subscriptions
  */
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
