import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatSnackBar, PageEvent } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import {
  InputAnneeSdComponent,
} from 'app/pages/dossiers/parametrage/parametrage-dossier/parametrage-session-decision/input-annee-sd/input-annee-sd.component';
import { ConfirmPopupComponent } from 'app/shared/confirm-popup/confirm-popup.component';
import { LocalDataSource } from 'ng2-smart-table';
import { Observable } from 'rxjs/Observable';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { SpinnerLuncher } from '../../../../../shared/methodes-generiques';
import {
  getErrorMessage,
  noDataMessage,
  snackbarConfigError,
  snackbarConfigErrorPersistant,
  snackbarConfigSuccess,
} from '../../../../../shared/shared.retourApi';
import { ProcedureDecision, SessionDecision } from '../../../dossier/dossier.interface';
import { DossierService } from '../../../dossiers.service';
import { CritereSessionDecision, Settings } from '../../../recherche-dossier/recherche-dossier.interface';
import { ActionSessionDecisionComponent } from './action-session-decision/action-session-decision.component';
import { InputDatePassageComponent } from './input-date-passage/input-date-passage.component';
import { InputNumeroSdComponent } from './input-numero/input-numero-sd.component';
import { InputTypeComponent } from './input-type/input-type.component';



@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-parametrage-session-decision',
  templateUrl: './parametrage-session-decision.component.html',
  styleUrls: ['./parametrage-session-decision.component.scss']
})
export class ParametrageSessionDecisionComponent implements OnInit, OnDestroy {

  /**
  * Source to be displayed in the table
  */
  source: LocalDataSource = new LocalDataSource();

  private unsubscribe = new Subject<void>();

  procedureDecisions: ProcedureDecision[] = [];

  indexCurrentPage;

  erreurDateEtAnnee: Boolean = false;

  /**
   * Configuration actuelle
   */
  currentCriteres: CritereSessionDecision

  /**
   * Displays the table once a result is available
   */
  searchDone = false;

  /**
  * error message to display
  */
  messageToDisplay: String = '';

  /**
   * Manage add sessions de decision button
   */
  canAdd: Boolean = true;
  /**
   * boolean that retrieves the state of the page when there are errors
   */
  pageHasError = false;

  valueCloseDialog = false;
  evenement: PageEvent;
  /**
   * Error used to disable or not the submit button
   */
  canSubmit: Boolean = true;

  /**
   * Used to know if sessions decision are modify (modified and/or added) or not
   */
  modified: Boolean = false;

  /* * Total number of elements in search
     */
  nbTotalElements: number;

  /**
   * Maximal number elements per page
   */
  pageSize = 15;

  /**
   * tab key handling
   */
  index_tab_type = 300000;
  index_tab_annee = 300001;
  index_tab_numero = 300002;
  index_tab_libelle = 300003;
  index_tab_date = 300004;

  /**
   * List of values that could been taken by number elements
   */
  pageSizeOption = [15, 30, 50];

  /**
   * Define structure of table (column and style)
  */
  settings: Settings = {
    actions: false,
    noDataMessage,
    hideSubHeader: true,
    columns: {
      procedure: {
        title: 'Procédure',
        type: 'custom',
        renderComponent: InputTypeComponent,
        onComponentInitFunction: (instance) => {
          this.index_tab_type += 4;
          instance.index_tab_type = this.index_tab_type;
          instance.updateSessionDecisionEvent.pipe(takeUntil(this.unsubscribe))
            .subscribe(value => {
              this.onEditEvent(value);
            });
        },
        filter: false,
        // width: '120px'
        width: '10%'
      },
      annee: {
        title: 'Année       ',
        type: 'custom',
        renderComponent: InputAnneeSdComponent,
        onComponentInitFunction: (instance) => {
          this.index_tab_annee += 4;
          instance.index_tab_annee = this.index_tab_annee;
          instance.updateSessionDecisionEvent.pipe(takeUntil(this.unsubscribe))
            .subscribe(value => {
              this.onEditEvent(value);
            });
        },
        filter: false,
        // width: '80px'
        width: '10%'
      },
      numero: {
        title: 'Numéro',
        type: 'custom',
        renderComponent: InputNumeroSdComponent,
        onComponentInitFunction: (instance) => {
          this.index_tab_numero += 4;
          instance.index_tab_numero = this.index_tab_numero;
          instance.updateSessionDecisionEvent.pipe(takeUntil(this.unsubscribe))
            .subscribe(value => {
              this.onEditEvent(value);
            });
        },
        filter: false,
        // width: '60px',
        width: '5%'

      },
      date: {
        title: 'Date passage',
        type: 'custom',
        renderComponent: InputDatePassageComponent,
        onComponentInitFunction: (instance) => {
          this.index_tab_date += 4;
          instance.index_tab_date = this.index_tab_date;
          instance.updateSessionDecisionEvent.pipe(takeUntil(this.unsubscribe))
            .subscribe(value => {
              this.onEditEvent(value);
            });
        },
        filter: false,
        // width: '120px',
        width: '6%',
      },
      myActions: {
        type: 'custom',
        renderComponent: ActionSessionDecisionComponent,
        onComponentInitFunction: (instance) => {
          instance.deleteApplicationEvent.pipe(takeUntil(this.unsubscribe)).subscribe(sessionDecision => {
            this.onDeleteSessionDecisionEvent(sessionDecision);
          });
        },
        width: '2%',
        filter: false,
        addable: false,
      },
    },
    pager: {
      display: false
    }
  };

  /**
   * List of dossiers
   */
  sessionDecisionDatas: SessionDecision[];

  /**
   * List of deleted sessions de decision
   */
  deletedsessionDecisionDatas: SessionDecision[] = [];
  constructor(
    public dialog: MatDialog,
    private _dossierService: DossierService,
    private _snackBar: MatSnackBar,
    private _changeDetector: ChangeDetectorRef,
    private _router: Router,
    private _route: ActivatedRoute,
    private spinnerLuncher: SpinnerLuncher

  ) { spinnerLuncher.show(); }

  ngOnInit() {

    this.currentCriteres = {
      type: '',
      annee: null, // id: ligne.id
      numero: null, // valide
      pageAAficher: 1, // numéro de la page a demander
      nbElemPerPage: 30 // nombre d'élément à afficher par page
    }
    this._dossierService.getSessionDecisionFiltre(null, null, null, this.currentCriteres.nbElemPerPage, this.currentCriteres.pageAAficher).subscribe(data => {
      this.sessionDecisionDatas = data.sessionsDecision;
      this.onFixDisableAndErrorsAfterSearch(this.sessionDecisionDatas);
      this.nbTotalElements = data.nombreTotalElements;
      this.pageSize = data.nombreElementsParPage;
      this.indexCurrentPage = data.numeroPageCourante;
      // this.loadDataSource();
      this.source.load(this.sessionDecisionDatas);
      this.spinnerLuncher.hide();
    });

    setTimeout(() => {
      this.procedureDecisions = this._dossierService.getProcedureDecisions();
    }, 1000);
  }

  /**
   * Active or deactive the button (Ajouter une session de decision)
   */
  manageAddButtonState(): void {
    this.canAdd = true;
    this.canSubmit = true;
    this.sessionDecisionDatas.forEach((sessionDecision) => {
      if (sessionDecision.type === '' || sessionDecision.annee === ''
        || sessionDecision.numero === '') {
        this.canAdd = false;
      }
      if (sessionDecision.dateError === true || sessionDecision.anneeError === true || sessionDecision.numeroError === true) {
        this.canSubmit = false;
      }
    });
  }
  /**
  * on edit SessionDecision component
  * @param row
  */
  onEditEvent(row) {
    this.testRowHasError(row);
    if (row.hasError === false) {
      this.manageAddButtonState();
    } else {
      this.canSubmit = false;
      this.canAdd = false;
    }
    if (row.modif) {
      this.modified = true;
    }
  }

  onSubmit() {
    if (this.canAdd && this.canSubmit) {
      this.deletedsessionDecisionDatas.forEach((data) => {
        this.sessionDecisionDatas.push(data);
      });
      this._dossierService.updateSessionDecision(this.sessionDecisionDatas).subscribe((sessionsDecision) => {
        this._snackBar.open(`Les sessions de décision ont bien été modifiées.`, 'X', snackbarConfigSuccess);
        this.modified = false;
        if (this.evenement) {
          this.currentCriteres.pageAAficher = this.evenement.pageIndex + 1;
          this.pageSize = this.evenement.pageSize;
        }
        this.deletedsessionDecisionDatas = [];
        this.fetchResultatRecherche(this.currentCriteres);
      },
        (error: HttpErrorResponse) => {
          const snackMessage = getErrorMessage(error, `La modification de sessions de décision a échoué. Contacter l'administrateur.`);
          const snackbarRef = this._snackBar.open(snackMessage, 'X', snackbarConfigErrorPersistant);
          snackbarRef.afterDismissed().pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
              console.error(error);
              this._changeDetector.detectChanges();
            });
          this.deletedsessionDecisionDatas = [];
          this.modified = false;
          this.fetchResultatRecherche(this.currentCriteres);
        });

    }

  }

  onDeleteSessionDecisionEvent(sessionDecision: SessionDecision) {
    sessionDecision.toDelete = true;
    if (this.deletedsessionDecisionDatas.length === 0) {
      this.deletedsessionDecisionDatas = [sessionDecision];
    } else {
      this.deletedsessionDecisionDatas.push(sessionDecision);
    }
    this.source.remove(sessionDecision);
    this.sessionDecisionDatas.splice(this.sessionDecisionDatas.indexOf(sessionDecision), 1);
    this.loadDataSource();
    this.modified = true;
  }

  /**
     * Add new Session Décision (push + OR empty tab)
     */
  onAddSessionDecision() {
    this.messageToDisplay = 'Veuillez saisir le type de procédure, l\'année et le numéro.';
    const newSessionDecision: SessionDecision = {
      id: null,
      type: '',
      annee: '',
      numero: '',
      date: null,
      disable: false,
      hasError: true,
      dateError: false,
      anneeError: false,
      numeroError: false,
      toDelete: false,
      modif: true
    };
    this.source.prepend(newSessionDecision);
    this.loadDataSource();
  }
  /** Récupérer le numéro de la page courante
      @param event Evenement émis par le paginateur, contiens le nombre d'éléments par page et le numéro index de la page courante.
       **/
  getNumberPage(event: PageEvent) {
    this.evenement = event;
    if (!this.modified) {
      this.currentCriteres.pageAAficher = this.evenement.pageIndex + 1;
      this.pageSize = this.evenement.pageSize;
      this.fetchResultatRecherche(this.currentCriteres);
    } else {
      this.canDeactivate();
    }

  }

  /**
   * get the corresponding dossiers for the search
   * @param criteresRecherche Object containing the various parameters by which done the search
   */
  fetchResultatRecherche(criteresRecherche: CritereSessionDecision) {
    if (this.modified) {
      this.spinnerLuncher.hide();
      this.openConfirmDialog().afterClosed().subscribe((resultat) => {
        if (resultat === 'save' || resultat === true) {
          this.resultatRecherche(criteresRecherche);
          this.modified = false;
        }
      });
    } else {
      this.resultatRecherche(criteresRecherche);
    }
  }

  resultatRecherche(criteresRecherche: CritereSessionDecision) {
    this.spinnerLuncher.show();
    const type = criteresRecherche.type ? criteresRecherche.type : null;
    const annee = criteresRecherche.annee ? criteresRecherche.annee : null;
    const numero = criteresRecherche.numero ? criteresRecherche.numero : null;
    this.currentCriteres = criteresRecherche;
    this.currentCriteres.nbElemPerPage = this.pageSize;
    this._dossierService.getSessionDecisionFiltre(type, annee, numero, this.currentCriteres.nbElemPerPage, this.currentCriteres.pageAAficher).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (data) => {
          this.sessionDecisionDatas = data.sessionsDecision;
          this.onFixDisableAndErrorsAfterSearch(this.sessionDecisionDatas);
          this.nbTotalElements = data.nombreTotalElements;

          this.pageSize = data.nombreElementsParPage;

          this.indexCurrentPage = data.numeroPageCourante;
          this.loadDataSource();
          this.evenement = null;
          this.spinnerLuncher.hide();
        },
        (error: HttpErrorResponse) => {
          this.spinnerLuncher.hide();
          const snackMessage = getErrorMessage(error, `La recherche de sessions de décision a échoué. Contacter l'administrateur.`);
          const snackbarRef = this._snackBar.open(snackMessage, 'X', snackbarConfigError);
          snackbarRef.afterDismissed().pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
              this._changeDetector.detectChanges();
            });
        });
  }
  onFixDisableAndErrorsAfterSearch(sessionsDecision) {
    sessionsDecision.forEach((sessionDecision) => {
      /* used to put date passage in data */
      // if (sessionDecision.date === null) {
      //   sessionDecision.date = new Date();
      // }
      sessionDecision.disable = true;
      sessionDecision.hasError = false;
      sessionDecision.dateError = false;
      sessionDecision.numeroError = false;
      sessionDecision.anneeError = false;
      sessionDecision.toDelete = false;
      sessionDecision.modif = false;
    });
  }
  /**
     *Load the data in the results table
     */
  loadDataSource(): void {
    // setTimeout(() => {
    this.source.load(this.sessionDecisionDatas);
    this.manageAddButtonState();
    this.searchDone = true;
    // }, 500);
  }

  // handle close button
  close() {
    this._router.navigate([`/accueil`]);
  }


  /**
   * Implements the guard canDeactivate() logic to being redirected
   */
  canDeactivate(): Observable<boolean> | boolean {
    if (this.modified) {
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
        valueStatusError: this.recoverErrorStatus(),
        typeAction: 'update'
      }
    });
    myDialog.afterClosed().subscribe(result => {
      if (result === 'save') {
        this.onSubmit();
        this.valueCloseDialog = true;
      } else if (result === true) {
        if (this.evenement) {
          this.currentCriteres.pageAAficher = this.evenement.pageIndex + 1;
          this.pageSize = this.evenement.pageSize;
          this.resultatRecherche(this.currentCriteres);
          this.modified = false;
        }
        this.valueCloseDialog = true;
      } else if (result === false) {
        if (this.evenement) {
          this.evenement = null;
        }

        const currentPage = this.indexCurrentPage;
        const sizeElement = this.pageSize;
        this.indexCurrentPage = -1;
        this.pageSize = -1;
        setTimeout(() => {
          this.indexCurrentPage = currentPage;
          this.pageSize = sizeElement;
        }, 10);
        this.valueCloseDialog = false;
      }
    });
    return myDialog;
  }

  /**
  * Recover the error status or not from the page
  */
  recoverErrorStatus(): Observable<boolean> | boolean {
    this.pageHasError = false;
    this.sessionDecisionDatas.forEach((data) => {
      if (data.hasError || data.dateError || data.numeroError || data.anneeError) {
        this.pageHasError = true;
      }

    });
    return this.pageHasError;
  }


  testRowHasError(row) {
    if (row.type !== '' && row.annee !== '' && row.numero !== '' && row.date !== null
      && !row.dateError && !row.numeroError && !row.anneeError) {
      row.hasError = false;
    } else {
      row.hasError = true;
    }
  }

  /**
  * Destroys pending subscriptions
  */
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
