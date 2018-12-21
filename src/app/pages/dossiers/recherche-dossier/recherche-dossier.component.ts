import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar, PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { GenericVariables } from 'app/shared/generic.variables';
import MethodeGenerique, { SpinnerLuncher } from 'app/shared/methodes-generiques';
import { SelectionLibelleComponent } from 'app/shared/selection-libelle-component/selection-libelle-component';
import { getErrorMessage, noDataMessage, snackbarConfigError } from 'app/shared/shared.retourApi';
import { LocalDataSource } from 'ng2-smart-table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Dossier } from '../dossiers.interface';
import { DossierService } from '../dossiers.service';
import { Critere, Settings } from './recherche-dossier.interface';



/**
 * Allows the search of a dossier with criterias
 */
@Component({
  selector: "siga-search-table",
  templateUrl: "./recherche-dossier.component.html",
  styleUrls: ["./recherche-dossier.component.scss"]
})
export class RechercheDossierComponent extends GenericVariables
  implements OnInit, OnDestroy {
  /**
   * Source to be displayed in the table
   */
  source: LocalDataSource = new LocalDataSource();
  query = "";
  private unsubscribe = new Subject<void>();
  /**
   * Define structure of table (column and style)
   */
  settings: Settings = {
    actions: false,
    noDataMessage,
    hideSubHeader: true,
    columns: {
      numeroDossier: {
        title: "Numéro dossier",
        type: "custom",
        // component généric sur l'intitulé avec un click programmé
        renderComponent: SelectionLibelleComponent,
        onComponentInitFunction: instance => {
          instance.editApplicationEvent.subscribe(row => {
            this.onTableRowClick(row);
          });
        },
        filter: false,
        width: "120px"
      },
      intitule: {
        title: "Intitulé",
        type: "txt",
        filter: false,
        width: "390px"
      },
      beneficiaire: {
        title: "Bénéficiaire",
        type: "txt",
        filter: false,
        width: "390px",
        valuePrepareFunction: (cell: any, row: any) => {
          return `${row.beneficiaire.reference} - ${
            row.beneficiaire.raisonSociale
            }`;
        }
      },
      phase: {
        title: "Phase",
        type: "txt",
        filter: false,
        width: "20px"
      }
    },
    pager: {
      display: false
    }
  };

  /**
   * List of dossiers
   */
  dossiersDatas: Dossier[];

  /**
   * Total number of elements in search
   */
  nbTotalElements: number;

  /**
   * Maximal number elements per page
   */
  pageSize = 15;

  /**
   * Liste des différents choix possibles de nombre d'élément par page
   */
  pageSizeOption = [15, 30, 50];

  /**
   * test before action the recherche  once a row is clicked
   */
  isClickAutorized = false;

  indexCurrentPage;

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
    super();
  }

  /**
   * Initialize the specific inputs
   */

  ngOnInit() {
    // store current and previous page
    if (this._dossierService.previousPage === "") {
      this._dossierService.previousPage = this.router.url;
    } else {
      this._dossierService.previousPage = this._dossierService.currentPage;
      if (!this._dossierService.currentPage.includes("/dossier")) {
        this._dossierService.formCritere = null;
      }
    }
    this._dossierService.currentPage = this.router.url;

    //  setTimeout(() => {
    this.thematiques = this._dossierService.getThematiques();
    this.phases = this._dossierService.getPhases()

    //  }, this._dossierService.delay);

    this._dossierService.getDepartements()
      .subscribe(depts => {
        this.depts = depts;
        this.depts.sort(MethodeGenerique.sortingDepartement);
      },
        (error: HttpErrorResponse) => {
          const snackbarRef = this._snackBar.open('Le référentiel département est indisponible. Contactez l\'administrateur', 'X', snackbarConfigError);
          snackbarRef.afterDismissed()
            .subscribe(() => {
              console.error(error);
              this._changeDetector.detectChanges();
            });
        });

    this._dossierService.getResponsableTech().subscribe(responsablestech => {
      this.responsablesTech = responsablestech;
    });
  }

  /**
   * get the corresponding dossiers for the search
   * @param criteresRecherche Object containing the various parameters by which done the search
   */
  fetchResultatRecherche(criteresRecherche: Critere) {
    this.submitted = true;
    this.currentCriteres = criteresRecherche;

    this.currentCriteres.nbElemPerPage = this.pageSize;

    this._dossierService.getResultatRecherche(criteresRecherche)
      .subscribe(
        (data) => {

          this.dossiersDatas = data.dossiers;
          this.nbTotalElements = data.nombreTotalElements;
          this.pageSize = data.nombreElementsParPage;
          this.indexCurrentPage = data.numeroPageCourante;
          this.loadDataSource();
          this.submitted = false;
          this.spinnerLuncher.hide();
        },
        (error: HttpErrorResponse) => {

          const snackMessage = getErrorMessage(error, `La recherche de dossiers a échoué. Contacter l'administrateur.`);
          const snackbarRef = this._snackBar.open(snackMessage, 'X', snackbarConfigError);
          snackbarRef.afterDismissed().pipe(takeUntil(this.unsubscribe))
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
    this.source.load(this.dossiersDatas);
    this.searchDone = true;
  }

  /**
   * On row click
   * @param row row clicked
   * TODO : Add row type
   */
  onDossierSelect(row: any) {
    // Redirect to update dossier
    this.router.navigate([`dossier/${row.data.id}`]);
  }

  /**
   * Manages the user selection for a given row
   * @param row the row selected with its data
   */
  onTableRowClick(row: any) {
    this.router.navigate([`dossier/${row.id}`]);
  }

  /**
   * Récupérer le numéro de la page courante
   * @param event Evenement émis par le paginateur, contiens le nombre d'éléments par page et le numéro index de la page courante.
   */
  getNumberPage(event: PageEvent) {
    this.currentCriteres.pageAAficher = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.fetchResultatRecherche(this.currentCriteres);
  }

  /**
   * Destroys pending subscriptions
   */
  ngOnDestroy() {
    // this.routerSubscription.unsubscribe();
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
