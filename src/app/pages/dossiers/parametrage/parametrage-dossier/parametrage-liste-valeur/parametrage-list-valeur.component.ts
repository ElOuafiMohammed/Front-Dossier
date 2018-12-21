import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatCheckboxChange, MatDialog, MatDialogConfig, MatOption, MatSnackBar, PageEvent } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ListValeurDataSource,
} from 'app/pages/dossiers/parametrage/parametrage-dossier/parametrage-liste-valeur/listValeur.dataSource';
import { ConfirmPopupComponent } from 'app/shared/confirm-popup/confirm-popup.component';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { LocalDataSource } from 'ng2-smart-table';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { SpinnerLuncher } from '../../../../../shared/methodes-generiques';
import {
  getErrorMessage,
  snackbarConfigError,
  snackbarConfigErrorPersistant,
  snackbarConfigSuccess,
} from '../../../../../shared/shared.retourApi';
import { Thematique } from '../../../create-dossier/create-dossier.interface';
import { ListValeur } from '../../../dossiers.interface';
import { DossierService } from '../../../dossiers.service';
import { CritereListValeur } from '../../../recherche-dossier/recherche-dossier.interface';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-parametrage-list-valeur',
  templateUrl: './parametrage-list-valeur.component.html',
  styleUrls: ['./parametrage-list-valeur.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ParametrageListValeurComponent implements OnInit, OnDestroy {

  /**
  * Source to be displayed in the table
  */
  source: LocalDataSource = new LocalDataSource();

  private unsubscribe = new Subject<void>();

  thematiques: Thematique[] = [];

  lignes: ListValeur[] = [];

  indexCurrentPage;
  /**
  * Columns of table
  */
  displayedColumns = ['Thematique', 'Param', 'Valeur', 'Libelle', 'Valide', 'actions'];
  expanded = false;
  dataSource: ListValeurDataSource;
  /**Used to display loading message */
  loading: Boolean = true;
  /**
   * Configuration actuelle
   */
  currentCriteres: CritereListValeur

  /**
   * Displays the table once a result is available
   */
  searchDone = false;

  /**
   * Manage add nature button
   */
  canAdd: Boolean = true;

  valueCloseDialog = false;
  evenement: PageEvent;

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
  pageSize = 30;

  /**
   * List of values that could been taken by number elements
   */
  pageSizeOption = [15, 30, 50];

  /**
   * List of list Valeurs
   */
  listValeursData: ListValeur[] = [];
  /**
  * List of list Valeurs to delete
  */
  deletedlistValeursData: ListValeur[] = [];

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  constructor(
    public dialog: MatDialog,
    private _dossierService: DossierService,
    private _snackBar: MatSnackBar,
    private _changeDetector: ChangeDetectorRef,
    private _router: Router,
    private _route: ActivatedRoute,
    private spinnerLuncher: SpinnerLuncher

  ) { }

  ngOnInit() {

    this.currentCriteres = {
      thematique: null, // id: thematique.id
      ligne: null, // id: ligne.id
      valide: null, // valide
      pageAAficher: 1, // numéro de la page a demander
      nbElemPerPage: 30 // nombre d'élément à afficher par page
    }

    setTimeout(() => {
      this.thematiques = this._dossierService.getThematiques();
      const totalObjet: Thematique = { code: 'TOUT', id: null, libelle: 'TOUT' };
      this.thematiques.splice(0, 0, totalObjet);
      this.lignes = this._dossierService.getListOfListValeurs();
    }, 1000);
  }

  changeThematique(element: ListValeur, thematique: MatOption) {
    if (thematique) {
      const indexElement = this.listValeursData.indexOf(element);
      this.modified = true;
      this.listValeursData[indexElement].codeThematique = thematique.value.code;
    }
    this.manageAddButtonState();
  }


  displayAsListThema(codeThematique: string): ListValeur {
    this.listValeursData.forEach(list => {
      if (list.codeThematique === codeThematique) {
        return list;
      }
    })
    return null;
  }

  changeParametre(element: ListValeur, ligne: MatOption) {
    if (ligne) {
      const indexElement = this.listValeursData.indexOf(element);
      this.modified = true;
      this.listValeursData[indexElement].codeParam = ligne.value.code;
    }
    this.manageAddButtonState();
  }


  displayAsListParam(param: string): ListValeur {
    this.listValeursData.forEach(list => {
      if (list.codeParam === param) {
        return list;
      }
    })
    return null;
  }


  libelleBlur(libelle: string, element: ListValeur) {
    const indexElement = this.listValeursData.indexOf(element);
    if (indexElement !== -1) {
      if (this.listValeursData[indexElement].libelle !== libelle) {
        this.modified = true;
      }
      this.listValeursData[indexElement].libelle = libelle;
    }
    this.manageAddButtonState();

  }

  valeurBlur(code: string, element: ListValeur) {
    const indexElement = this.listValeursData.indexOf(element);
    if (indexElement !== -1) {
      if (this.listValeursData[indexElement].code !== code) {
        this.modified = true;
      }
      this.listValeursData[indexElement].code = code;
    }
    this.manageAddButtonState();

  }

  paramBlur(codeParam: string, element: ListValeur) {
    const indexElement = this.listValeursData.indexOf(element);
    if (indexElement !== -1) {
      if (this.listValeursData[indexElement].codeParam !== codeParam) {
        this.modified = true;
      }
      this.listValeursData[indexElement].codeParam = codeParam;
    }
    this.manageAddButtonState();

  }

  onCheckBoxChange(event: MatCheckboxChange, element: ListValeur) {
    const idCurrentListValeur = element ? element.id : null;
    this.listValeursData.forEach(list => {
      if (list.id === idCurrentListValeur) {
        list.valide = !list.valide;
      }
    });
    this.modified = true;
  }

  deleteRow(element: ListValeur) {
    this.listValeursData.splice(this.listValeursData.indexOf(element), 1);
    if (element.id !== null) {
      element.toDelete = true;
      this.deletedlistValeursData.push(element);
    }
    this.modified = true;
    this.dataSource = new ListValeurDataSource(this.listValeursData);
    this.manageAddButtonState();

  }

  isNew(element: ListValeur): boolean {
    if (element.id !== null) {
      return false;
    }
    return true;
  }

  /**
   * Active or deactive the button (Ajouter une nature)
   */
  manageAddButtonState(): void {
    this.canAdd = true;
    this.listValeursData.forEach((listValeur) => {
      if (listValeur.codeThematique === '' || listValeur.libelle === ''
        || listValeur.code === '' || listValeur.codeParam === '') {
        this.canAdd = false;
      }
    });
  }

  onSubmit() {
    this.spinnerLuncher.show();
    if (this.canAdd) {
      this.deletedlistValeursData.forEach((data) => {
        this.listValeursData.push(data);
      });
      this._dossierService.updateListValeurs(this.listValeursData).subscribe((listes) => {
        this._snackBar.open(`Les listes de valeurs ont bien été modifiées.`, 'X', snackbarConfigSuccess);
        this.modified = false;
        if (this.evenement) {
          this.currentCriteres.pageAAficher = this.evenement.pageIndex + 1;
          this.pageSize = this.evenement.pageSize;
        }
        this.deletedlistValeursData = [];
        this.fetchResultatRecherche(this.currentCriteres);
        this.spinnerLuncher.hide();
      },
        (error: HttpErrorResponse) => {
          this.spinnerLuncher.hide();
          const snackMessage = getErrorMessage(error, `La modification de listes de valeurs a échoué. Contacter l'administrateur.`);
          const snackbarRef = this._snackBar.open(snackMessage, 'X', snackbarConfigErrorPersistant);
          snackbarRef.afterDismissed().pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
              console.error(error);
              this._changeDetector.detectChanges();
            });
          this.deletedlistValeursData = [];
          this.modified = false;
          this.fetchResultatRecherche(this.currentCriteres);
        });

    }

  }

  /**
     * Add new list valeur
     */
  addLine() {
    const newListValeur: ListValeur = {
      id: null,
      // codeThematique: this.thematiques.find(thematiq => thematiq.code === 'AEEP'),
      codeThematique: 'TOUT',
      libelle: '',
      toDelete: false,
      code: '',
      valide: true,
      codeParam: ''
    };
    this.listValeursData.splice(0, 0, newListValeur);
    this.dataSource = new ListValeurDataSource(this.listValeursData);
    this.modified = true;
    this.canAdd = false;
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
  fetchResultatRecherche(criteresRecherche: CritereListValeur) {
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
  resultatRecherche(criteresRecherche: CritereListValeur) {
    this.spinnerLuncher.show();
    const thematique = criteresRecherche.thematique ? criteresRecherche.thematique.code : null;
    const param = criteresRecherche.ligne ? criteresRecherche.ligne.code : null;
    const valide = criteresRecherche.valide;

    this.currentCriteres = criteresRecherche;
    this.currentCriteres.nbElemPerPage = this.pageSize;
    this._dossierService.searchListValeurs(thematique, param, valide, this.currentCriteres.nbElemPerPage, this.currentCriteres.pageAAficher).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (data) => {
          this.canAdd = true;
          this.modified = false;

          this.listValeursData = data.listValeurs;
          // Init the datasource using component DossierDataSource
          this.dataSource = new ListValeurDataSource(data.listValeurs);
          this.loading = false;
          this.nbTotalElements = data.nombreTotalElements;
          this.pageSize = data.nombreElementsParPage;
          this.indexCurrentPage = data.numeroPageCourante;
          this.evenement = null;
          this.spinnerLuncher.hide();
        },
        (error: HttpErrorResponse) => {
          this.spinnerLuncher.hide();
          const snackMessage = getErrorMessage(error, `La recherche de list de valeurs a échoué. Contacter l'administrateur.`);
          const snackbarRef = this._snackBar.open(snackMessage, 'X', snackbarConfigError);
          snackbarRef.afterDismissed().pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
              this._changeDetector.detectChanges();
            });
        });
  }

  isExpansionMotifDossier = (i: number, row: Object) => row.hasOwnProperty('detailRow');

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
        valueStatusError: false,
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

  generateTabIndex(): number {
    let index = 5;
    index++;
    return index;
  }
  /**
  * Destroys pending subscriptions
  */
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
