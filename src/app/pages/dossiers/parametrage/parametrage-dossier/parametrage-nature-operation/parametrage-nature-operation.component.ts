import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatSnackBar, PageEvent } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmPopupComponent } from 'app/shared/confirm-popup/confirm-popup.component';
import * as moment from 'moment';
import { LocalDataSource } from 'ng2-smart-table';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { SpinnerLuncher } from '../../../../../shared/methodes-generiques';
import {
  getErrorMessage,
  noDataMessage,
  snackbarConfigError,
  snackbarConfigErrorPersistant,
  snackbarConfigSuccess,
} from '../../../../../shared/shared.retourApi';
import { Ligne, Thematique } from '../../../create-dossier/create-dossier.interface';
import { NatureOperation } from '../../../dossier/dossier.interface';
import { DossierService } from '../../../dossiers.service';
import { CritereNatureOperation, Settings } from '../../../recherche-dossier/recherche-dossier.interface';
import { ActionNatureOperationComponent } from './action-nature-operation/action-nature-operation.component';
import { InputFinValiditeComponent } from './input-fin-validite/input-fin-validite.component';
import { InputLibelleComponent } from './input-libelle/input-libelle.component';
import { InputLigneComponent } from './input-ligne/input-ligne.component';
import { InputNatNumeroComponent } from './input-numero/input-nat-numero.component';
import { InputThematiqueComponent } from './input-thematique/input-thematique.component';



@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-parametrage-nature-operation',
  templateUrl: './parametrage-nature-operation.component.html',
  styleUrls: ['./parametrage-nature-operation.component.scss']
})
export class ParametrageNatureOperationComponent implements OnInit, OnDestroy {

  /**
  * Source to be displayed in the table
  */
  source: LocalDataSource = new LocalDataSource();

  private unsubscribe = new Subject<void>();

  thematiques: Thematique[] = [];

  lignes: Ligne[] = [];

  indexCurrentPage;


  /**
   * Configuration actuelle
   */
  currentCriteres: CritereNatureOperation

  /**
   * Displays the table once a result is available
   */
  searchDone = false;

  /**
  * error message to display
  */
  messageToDisplay: String = '';

  /**
   * Manage add nature button
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
   * Used to know if natures are modify (modified and/or added) or not
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
  index_tab_thematique = 300000;
  index_tab_ligne = 300001;
  index_tab_numero = 300002;
  index_tab_libelle = 300003;
  index_tab_dateFinValidite = 300004;

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
      codeThematique: {
        title: 'Thématique',
        type: 'custom',
        renderComponent: InputThematiqueComponent,
        onComponentInitFunction: (instance) => {
          this.index_tab_thematique += 5;
          instance.index_tab_thematique = this.index_tab_thematique;
          instance.updateNatureEvent.pipe(takeUntil(this.unsubscribe))
            .subscribe(value => {
              this.onEditEvent(value);
            });
        },
        filter: false,
        // width: '120px'
        width: '10%'
      },
      ligne: {
        title: 'Ligne       ',
        type: 'custom',
        renderComponent: InputLigneComponent,
        onComponentInitFunction: (instance) => {
          this.index_tab_ligne += 5;
          instance.index_tab_ligne = this.index_tab_ligne;
          instance.updateNatureEvent.pipe(takeUntil(this.unsubscribe))
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
        renderComponent: InputNatNumeroComponent,
        onComponentInitFunction: (instance) => {
          this.index_tab_numero += 5;
          instance.index_tab_numero = this.index_tab_numero;
          instance.updateNatureEvent.pipe(takeUntil(this.unsubscribe))
            .subscribe(value => {
              this.onEditEvent(value);
            });
        },
        filter: false,
        // width: '60px',
        width: '10%'

      },
      libelle: {
        title: 'Libellé',
        type: 'custom',
        renderComponent: InputLibelleComponent,
        onComponentInitFunction: (instance) => {
          this.index_tab_libelle += 5;
          instance.index_tab_libelle = this.index_tab_libelle;
          instance.updateNatureEvent.pipe(takeUntil(this.unsubscribe))
            .subscribe(value => {
              this.onEditEvent(value);
            });
        },
        filter: false,
        // width: '200px'
        width: '40%'
      },

      dateDebutValidite: {
        title: 'Début validité',
        type: 'text',
        filter: false,
        // width: '120px',
        width: '13%',
        valuePrepareFunction: (row: any) => {
          if (row) {
            return moment(row).locale('fr').format('DD/MM/YYYY');
          }
        }
      },
      dateFinValidite: {
        title: 'Fin validité',
        type: 'custom',
        renderComponent: InputFinValiditeComponent,
        onComponentInitFunction: (instance) => {
          this.index_tab_dateFinValidite += 5;
          instance.index_tab_dateFinValidite = this.index_tab_dateFinValidite;
          instance.updateNatureEvent.pipe(takeUntil(this.unsubscribe))
            .subscribe(value => {
              this.onEditEvent(value);
            });
        },
        filter: false,
        // width: '120px',
        width: '13%',
      },
      myActions: {
        type: 'custom',
        renderComponent: ActionNatureOperationComponent,
        onComponentInitFunction: (instance) => {
          instance.deleteApplicationEvent.pipe(takeUntil(this.unsubscribe)).subscribe(natureOperation => {
            this.onDeleteNatureOperationEvent(natureOperation);
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
  natureDatas: NatureOperation[];

  /**
   * List of deleted natures
   */
  deletedNatureDatas: NatureOperation[] = [];
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
      thematique: null, // id: thematique.id
      ligne: null, // id: ligne.id
      valide: null, // valide
      pageAAficher: 1, // numéro de la page a demander
      nbElemPerPage: 30 // nombre d'élément à afficher par page
    }
    this._dossierService.getNatureOperation(null, null, null, this.currentCriteres.nbElemPerPage, this.currentCriteres.pageAAficher).subscribe(data => {
      this.natureDatas = data.natureOperations;
      this.onFixDisableAfterSearch(this.natureDatas);
      this.nbTotalElements = data.nombreTotalElements;
      this.pageSize = data.nombreElementsParPage;
      this.indexCurrentPage = data.numeroPageCourante;
      if (this.natureDatas) {
        this.source.load(this.natureDatas);
      }
      this.spinnerLuncher.hide();
    });

    setTimeout(() => {
      this.thematiques = this._dossierService.getThematiques()
      this.lignes = this._dossierService.getLignes();
      console.log('ooooo>', this.lignes)
    }, this._dossierService.delay + 500);

  }

  /**
   * Active or deactive the button (Ajouter une nature)
   */
  manageAddButtonState(): void {
    this.canAdd = true;
    this.canSubmit = true;
    this.natureDatas.forEach((natureOperation) => {
      if (natureOperation.codeThematique === null || natureOperation.ligne === ''
        || natureOperation.numero === '' || natureOperation.libelle === '') {
        this.canAdd = false;
      }
      if (natureOperation.dateError === true) {
        this.canSubmit = false;
      }
    });
  }
  /**
  * on edit Nature component
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
      this.spinnerLuncher.show();
      this.deletedNatureDatas.forEach((data) => {
        this.natureDatas.push(data);
      });
      this._dossierService.updateNatureOperation(this.natureDatas).subscribe((natures) => {
        this._snackBar.open(`Les natures d'opération ont bien été modifiées.`, 'X', snackbarConfigSuccess);
        this.modified = false;
        if (this.evenement) {
          this.currentCriteres.pageAAficher = this.evenement.pageIndex + 1;
          this.pageSize = this.evenement.pageSize;
        }
        this.deletedNatureDatas = [];
        this.fetchResultatRecherche(this.currentCriteres);
        this.spinnerLuncher.hide();
      },
        (error: HttpErrorResponse) => {
          this.spinnerLuncher.hide();
          const snackMessage = getErrorMessage(error, `La modification de natures d'opération a échoué. Contacter l'administrateur.`);
          const snackbarRef = this._snackBar.open(snackMessage, 'X', snackbarConfigErrorPersistant);
          snackbarRef.afterDismissed().pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
              console.error(error);
              this._changeDetector.detectChanges();
            });
          this.deletedNatureDatas = [];
          this.modified = false;
          this.fetchResultatRecherche(this.currentCriteres);
        });

    }

  }

  onDeleteNatureOperationEvent(natureOperation: NatureOperation) {
    natureOperation.toDelete = true;
    if (this.deletedNatureDatas.length === 0) {
      this.deletedNatureDatas = [natureOperation];
    } else {
      this.deletedNatureDatas.push(natureOperation);
    }
    this.source.remove(natureOperation);
    if (this.natureDatas) {
      this.natureDatas.splice(this.natureDatas.indexOf(natureOperation), 1);
      this.loadDataSource();
      this.modified = true;
    }
  }

  /**
     * Add new Nature operation (push + OR empty tab)
     */
  onAddNatureOperation() {
    this.messageToDisplay = 'Veuillez saisir la thématique, la ligne et le numéro.';
    const today = new Date().toISOString().substring(0, 10);
    // const today = new Date();
    const newNature: NatureOperation = {
      id: null,
      // codeThematique: this.thematiques.find(thematiq => thematiq.code === 'AEEP'),
      codeThematique: '',
      ligne: '',
      numero: '',
      libelle: '',
      dateDebutValidite: today,
      dateFinValidite: null,
      disable: false,
      hasError: true,
      dateError: false,
      toDelete: false,
      modif: true
    };
    this.source.prepend(newNature);
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
  fetchResultatRecherche(criteresRecherche: CritereNatureOperation) {
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
  resultatRecherche(criteresRecherche: CritereNatureOperation) {
    this.spinnerLuncher.show();
    const thematique = criteresRecherche.thematique ? criteresRecherche.thematique.code : null;
    const ligne = criteresRecherche.ligne ? criteresRecherche.ligne.numero : null;
    const valide = criteresRecherche.valide;

    this.currentCriteres = criteresRecherche;
    this.currentCriteres.nbElemPerPage = this.pageSize;
    this._dossierService.getNatureOperation(thematique, ligne, valide, this.currentCriteres.nbElemPerPage, this.currentCriteres.pageAAficher).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (data) => {
          this.natureDatas = data.natureOperations;
          this.onFixDisableAfterSearch(this.natureDatas);
          this.nbTotalElements = data.nombreTotalElements;

          this.pageSize = data.nombreElementsParPage;

          this.indexCurrentPage = data.numeroPageCourante;
          this.loadDataSource();
          this.evenement = null;
          this.spinnerLuncher.hide();
        },
        (error: HttpErrorResponse) => {
          this.spinnerLuncher.hide();
          const snackMessage = getErrorMessage(error, `La recherche de natures d'opération a échoué. Contacter l'administrateur.`);
          const snackbarRef = this._snackBar.open(snackMessage, 'X', snackbarConfigError);
          snackbarRef.afterDismissed().pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
              this._changeDetector.detectChanges();
            });
        });
  }
  onFixDisableAfterSearch(natures) {
    if (natures) {
      natures.forEach((natureOperation) => {
        natureOperation.disable = true;
        natureOperation.hasError = false;
        natureOperation.dateError = false;
        natureOperation.toDelete = false;
        natureOperation.modif = false;
      });
    }
  }
  /**
  *Load the data in the results table
  */
  loadDataSource(): void {
    this.source.load(this.natureDatas);
    this.manageAddButtonState();
    this.searchDone = true;
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
    this.natureDatas.forEach((data) => {
      if (data.hasError || data.dateError) {
        this.pageHasError = true;
      }

    });
    return this.pageHasError;
  }

  testRowHasError(row) {
    if (row.codeThematique !== '' && row.ligne !== '' && row.numero !== ''
      && row.libelle !== '' && !row.dateError && !row.numeroError) {
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
