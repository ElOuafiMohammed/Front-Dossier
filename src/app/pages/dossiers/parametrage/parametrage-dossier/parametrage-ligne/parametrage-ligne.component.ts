
import { map, takeUntil } from 'rxjs/operators';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Thematique, Ligne } from '../../../create-dossier/create-dossier.interface';
import { DossierService } from '../../../dossiers.service';
import { CritereLigne } from '../../../recherche-dossier/recherche-dossier.interface';
import { getErrorMessage, snackbarConfigError, snackbarConfigSuccess, snackbarConfigErrorPersistant } from '../../../../../shared/shared.retourApi';
import {
  MatDialog,
  MatDialogConfig,
  MatSnackBar,
  PageEvent,
  MatCheckboxChange,
  MatOption
} from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { LocalDataSource } from 'ng2-smart-table';
import { Subject, Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmPopupComponent } from 'app/shared/confirm-popup/confirm-popup.component';
import { ListValeur } from '../../../dossiers.interface';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { LigneDataSource } from './ligne.dataSource';
import { Lignes } from 'app/pages/dossiers/dossier/dossier.interface';
import { FormGroup } from '@angular/forms';
import { SpinnerLuncher } from '../../../../../shared/methodes-generiques';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-parametrage-ligne',
  templateUrl: './parametrage-ligne.component.html',
  styleUrls: ['./parametrage-ligne.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ParametrageLigneComponent implements OnInit, OnDestroy {

  /**
  * Source to be displayed in the table
  */
  source: LocalDataSource = new LocalDataSource();

  private unsubscribe = new Subject<void>();

  thematiques: Thematique[] = [];

  lignes: ListValeur[] = [];
  formLignes: FormGroup;

  indexCurrentPage;
  /**
  * Columns of table
  */
  displayedColumns = ['Thematique', 'CodeLigne', 'Libelle', 'DebutValidite', 'FinValidite', 'actions'];
  // , 'actions'
  // , 'DebutValidite', 'FinValidite'
  expanded = false;
  dataSource: LigneDataSource;
  /**Used to display loading message */
  loading: boolean = true;
  /**
   * Configuration actuelle
   */
  currentCriteres: CritereLigne

  /**
   * Displays the table once a result is available
   */
  searchDone = false;
  /**
   * to controle if the format of dateFinValidite is correct
   */
  formatDateError = false;

  /**
   * to controle if the dateFinValidite is less then debut
   */
  inValidDateError = false;

  /**
   * Manage add nature button
   */
  canAdd: boolean = true;

  valueCloseDialog = false;
  evenement: PageEvent;

  /**
   * Used to know if natures are modify (modified and/or added) or not
   */
  modified: boolean = false;

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
  //  lignesData: Lignes[] = [];
  /**
 * List of dossiers
 */
  lignesDatas: Lignes[];
  /**
  * List of list Valeurs to delete
  */
  deletedlignesData: Lignes[] = [];

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  /**
   * stocke la date du jour
   */
  today = new Date().toISOString().substring(0, 10);

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
      valide: null, // valide
      pageAAficher: 1, // numéro de la page a demander
      nbElemPerPage: 30 // nombre d'élément à afficher par page
    }
    this._dossierService.getLignesInterv(null, this.currentCriteres.valide, this.currentCriteres.nbElemPerPage, this.currentCriteres.pageAAficher).subscribe(data => {
      this.lignesDatas = data.lignes;
      this.onFixDisableAfterSearch(this.lignesDatas);
      this.nbTotalElements = data.nombreTotalElements;
      this.loading = false;
      this.pageSize = data.nombreElementsParPage;
      this.indexCurrentPage = data.numeroPageCourante;
      if (this.lignesDatas) {
        this.source.load(this.lignesDatas);
      }
      this.spinnerLuncher.hide();
    });


    setTimeout(() => {
      this.thematiques = this._dossierService.getThematiques();
      this.lignes = this._dossierService.getLignes();
    }, 1000);
    this.fetchResultatRecherche(this.currentCriteres);
  }
  onFixDisableAfterSearch(lignes) {
    if (lignes) {
      lignes.forEach((ligne) => {
        ligne.disable = true;
        ligne.hasError = false;
        ligne.dateError = false;
        ligne.toDelete = false;
        ligne.modif = false;
      });
    }
  }
  changeThematique(element: Lignes, thematique: MatOption) {
    if (thematique) {
      const indexElement = this.lignesDatas.indexOf(element);
      this.modified = true;
      this.lignesDatas[indexElement].codeThematique = thematique.value.code;
    }
    this.manageAddButtonState();
  }

  displayAsListThema(codeThematique: string): Lignes {
    this.lignesDatas.forEach(list => {
      if (list.codeThematique === codeThematique) {
        return list;
      }
    })
    return null;
  }

  changeLigne(element: Lignes, event) {
    if (element) {
      const indexElement = this.lignesDatas.indexOf(element);
      this.modified = true;
      this.lignesDatas[indexElement].numero = event.target.value;
    }
    this.manageAddButtonState();
  }


  displayAsLigne(numero: string): Lignes {
    this.lignesDatas.forEach(list => {
      if (list.numero === numero) {
        return list;
      }
    })
    return null;
  }


  libelleBlur(libelle: string, element: Lignes) {
    const indexElement = this.lignesDatas.indexOf(element);
    if (indexElement !== -1) {
      if (this.lignesDatas[indexElement].libelle !== libelle) {
        this.modified = true;
      }
      this.lignesDatas[indexElement].libelle = libelle;
    }
    this.manageAddButtonState();

  }

  controlLength(codeLigne: string) {
    console.log('**********>', codeLigne)
    console.log('**********>', codeLigne.substring(0, 3));
    return codeLigne.substring(0, 3);
  }
  onDateFinValidite(dateFinValidite: string, element: Lignes) {
    this.formatDateError = false;
    this.inValidDateError = false;
    const indexElement = this.lignesDatas.indexOf(element);


    /**
     * formatage de la date retourné en format timestimp
     */

    let dateAFormater = dateFinValidite.split("/");
    dateFinValidite = dateAFormater[2] + "-" + dateAFormater[1] + "-" + dateAFormater[0];
    if (indexElement !== -1) {

      if (this.lignesDatas[indexElement].dateFinValidite !== dateFinValidite) {
        this.modified = true;
        if (dateFinValidite < this.lignesDatas[indexElement].dateDebutValidite) {
          this.lignesDatas[indexElement].dateError = true;
          this.inValidDateError = true;
          this.canAdd = false;
        } else if (!this.formatDateError) {
          this.lignesDatas[indexElement].dateError = false;
          this.inValidDateError = false;
          this.manageAddButtonState();
        }

        if (dateAFormater.length !== 3 || (isNaN(parseInt(dateAFormater[0])) || isNaN(parseInt(dateAFormater[1])) || isNaN(parseInt(dateAFormater[2])))
          || parseInt(dateAFormater[0]) > 31 || parseInt(dateAFormater[1]) > 12 || parseInt(dateAFormater[2]) > 2050 || dateAFormater[1].length > 2 || dateAFormater[2].length > 4 || dateAFormater[0].length > 2) {
          this.lignesDatas[indexElement].dateError = true;
          this.canAdd = false;
          this.formatDateError = true;
        } else if (!this.inValidDateError) {
          this.lignesDatas[indexElement].dateError = false;
          this.formatDateError = false;
          this.manageAddButtonState();
        }
      }

      this.lignesDatas[indexElement].dateFinValidite = dateFinValidite;



    }


  }


  deleteRow(element: Lignes) {
    this.lignesDatas.splice(this.lignesDatas.indexOf(element), 1);
    if (element.id !== null) {
      element.toDelete = true;
      this.deletedlignesData.push(element);
    }
    this.modified = true;
    this.dataSource = new LigneDataSource(this.lignesDatas);
    this.manageAddButtonState();

  }

  isNew(element: Lignes): boolean {
    if (element.id !== null) {
      return false;
    }
    return true;
  }

  /**
   * Active or deactive the button (Ajouter une ligne)
   */
  manageAddButtonState(): void {
    this.canAdd = true;


    this.lignesDatas.forEach((ligne) => {
      if (ligne.codeThematique === '' || ligne.libelle === '' || ligne.numero === ''
        || ligne.dateDebutValidite === '') {
        this.canAdd = false;
      }
    });
  }

  onSubmit() {
    this.spinnerLuncher.show();
    if (this.canAdd) {
      this.deletedlignesData.forEach((data) => {
        this.lignesDatas.push(data);
      });
      this._dossierService.updateLignesInterv(this.lignesDatas).subscribe((listes) => {
        this._snackBar.open(`Les listes de valeurs ont bien été modifiées.`, 'X', snackbarConfigSuccess);
        this.modified = false;
        if (this.evenement) {
          this.currentCriteres.pageAAficher = this.evenement.pageIndex + 1;
          this.pageSize = this.evenement.pageSize;
        }
        this.deletedlignesData = [];
        this.spinnerLuncher.hide();
        this.fetchResultatRecherche(this.currentCriteres);
      },
        (error: HttpErrorResponse) => {
          const snackMessage = getErrorMessage(error, `La modification de listes de valeurs a échoué. Contacter l'administrateur.`);
          const snackbarRef = this._snackBar.open(snackMessage, 'X', snackbarConfigErrorPersistant);
          this.spinnerLuncher.hide();
          snackbarRef.afterDismissed().pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
              console.error(error);
              this._changeDetector.detectChanges();
            });
          this.deletedlignesData = [];
          this.modified = false;
          this.fetchResultatRecherche(this.currentCriteres);
        });

    }

  }


  addLine() {
    const newLigne: Lignes = {
      id: null,
      codeThematique: '',
      numero: '',
      libelle: '',
      dateDebutValidite: this.today,
      dateFinValidite: '',
      toDelete: false,
      valide: true,
      hasError: true,
      dateError: false,
      numeroError: false,
      disable: false,
      modif: true,

    };
    this.lignesDatas.splice(0, 0, newLigne);
    this.dataSource = new LigneDataSource(this.lignesDatas);
    // this.modified = false;
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
  fetchResultatRecherche(criteresRecherche: CritereLigne) {
    if (this.modified) {
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
  resultatRecherche(criteresRecherche: CritereLigne) {
    this.spinnerLuncher.show();
    const thematique = criteresRecherche.thematique ? criteresRecherche.thematique.code : null;
    const valide = criteresRecherche.valide;
    this.currentCriteres = criteresRecherche;
    this.currentCriteres.nbElemPerPage = this.pageSize;
    this._dossierService.searchLignes(thematique, valide, this.currentCriteres.nbElemPerPage, this.currentCriteres.pageAAficher).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (data) => {
          this.canAdd = true;
          this.modified = false;
          this.lignesDatas = data.lignes;
          // Init the datasource using component DossierDataSource
          this.dataSource = new LigneDataSource(data.lignes);
          this.loading = false;
          this.nbTotalElements = data.nombreTotalElements;
          this.pageSize = data.nombreElementsParPage;
          this.indexCurrentPage = data.numeroPageCourante;
          this.evenement = null;
          this.spinnerLuncher.hide();
        },
        (error: HttpErrorResponse) => {
          const snackMessage = getErrorMessage(error, `La recherche de list de valeurs a échoué. Contacter l'administrateur.`);
          const snackbarRef = this._snackBar.open(snackMessage, 'X', snackbarConfigError);
          this.spinnerLuncher.show();
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
