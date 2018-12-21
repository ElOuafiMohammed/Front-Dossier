import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import {
  BenefRegex,
  Commune,
  CritereSearchBeneficiaire,
  Departements,
  NicRegex,
  SirenRegex,
} from 'app/pages/dossiers/dossiers.interface';
import { ComponentViewRightMode, DossierService } from 'app/pages/dossiers/dossiers.service';
import { noDataMessage, snackbarConfigError } from 'app/shared/shared.retourApi';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { LocalDataSource } from 'ng2-smart-table';
import { Observable, Subject } from 'rxjs';

import GeneriqueListValeur from '../generic-listValeur';
import MethodeGenerique, { minSearchLength } from '../methodes-generiques';

@Component({
  templateUrl: './search-popup-interlocuteur.component.html',
  styleUrls: ['./search-popup-interlocuteur.component.scss'],
})
export class SearchPopupInterlocuteurComponent extends ComponentViewRightMode implements OnInit, OnDestroy {

  /**
   * Critère courant
   */
  currentCritere: CritereSearchBeneficiaire;

  /**
   * Nombre total des éléments correspondants à la recherche
   */
  nbTotalElements: number;

  /**
   * Nombre maximal d'élément par page
   */
  pageSize = 15;

  /**
   * Liste des différents choix possibles de nombre d'élément par page
   */
  pageSizeOption = [15, 30, 50];

  /**
  * Index de la page actuelle
  */
  indexCurrentPage;

  /**
   * Search criteria form
   */
  formSearchPopup: FormGroup;

  /**
   * Load data
   */
  source: LocalDataSource = new LocalDataSource();

  /**
   * table of criteria data
   */
  dataOfTable: CritereSearchBeneficiaire[] = [];

  /**
   * List of commune
   */
  listCommune: Commune[] = [];

  /**
   * List of department
   */
  listDepartement: Departements[] = [];

  /**
  * value of unsubcribe
  */
  private unsubscribe = new Subject<void>();

  filteredDepartement: Observable<Departements[]>;
  readonly departementValidatorKey = 'departementNotFound';
  filteredCommune: Observable<Commune[]>;
  readonly communeValidatorKey = 'communeNotFound';

  /**
   * Initialisation of table
   */
  settings = {
    actions: false,
    noDataMessage,
    hideSubHeader: true,
    columns: {
      reference: {
        title: 'Numéro Agence',
        type: 'txt',
        filter: false,
        width: '20%'
      },
      raisonSociale: {
        title: 'Nom',
        type: 'txt',
        filter: false,
        width: '55%'
      },
      actifLibelle: {
        title: 'État',
        type: 'txt',
        filter: false,
        width: '5%',
      },
      myActions: {
        type: 'txt',
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
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  /**
   * Controls of search criteria form
   */
  get nomControl() { return this.formSearchPopup.get('nom'); }
  get departementControl() { return this.formSearchPopup.get('departement'); }
  get communeControl() { return this.formSearchPopup.get('commune'); }
  get sirenControl() { return this.formSearchPopup.get('siren'); }
  get nicControl() { return this.formSearchPopup.get('nic'); }
  get numeroAgenceControl() { return this.formSearchPopup.get('numeroAgence'); }
  get inactifControl() { return this.formSearchPopup.get('inactif'); }


  /**
   * Constructor of component
   * @param data: data of dossier passed in parameter
   * @param dialogRef: reference of object dialog
   * @param translate
   * @param dossierService: Service's file of application
   * @param _formBuilder
   * @param _snackbar used to display snackbars
   * @param _changeDetector triggers Angular change detection
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<SearchPopupInterlocuteurComponent>,
    public translate: TranslateService,
    public dossierService: DossierService,
    private _formBuilder: FormBuilder,
    private _snackbar: MatSnackBar,
    private _changeDetector: ChangeDetectorRef
  ) {
    super(dossierService);
  }


  /**
   * Initialisation fo component
   */
  ngOnInit(): void {
    this.formSearchPopup = this._formBuilder.group({
      nom: [null, []],
      departement: [null, []],
      commune: [null, []],
      siren: [null, [Validators.maxLength(9), Validators.pattern(SirenRegex)]],
      nic: [null, [Validators.maxLength(5), Validators.pattern(NicRegex)]],
      numeroAgence: [null, [Validators.maxLength(9), Validators.pattern(BenefRegex)]],
      inactif: [null, []]
    });

    this.initialisationPage();

  }

  /**
    * Init search criteria fields
   */
  initialisationPage() {
    this.sirenControl.value && !this.sirenControl.hasError('pattern') ? this.nicControl.enable() : this.nicControl.disable();

    this.sirenControl.valueChanges.subscribe((siren) => {
      if (this.sirenControl.value && this.sirenControl.valid) {
        this.nicControl.enable();
      } else {
        this.nicControl.reset();
        this.nicControl.disable();
      }
    })

    this.dossierService.getDepartements().subscribe((list) => {
      this.listDepartement = list;
      this.listDepartement.sort(MethodeGenerique.sortingDepartement);
      this.filteredDepartement = GeneriqueListValeur.filtringList(this.listDepartement, this.departementControl, this.departementValidatorKey, minSearchLength, 'departement');

      this.departementControl.valueChanges.subscribe((dept) => {
        this.disableCommune(dept);
      });
    },
      (error: HttpErrorResponse) => {
        const snackbarRef = this._snackbar.open('Le référentiel département est indisponible. Contactez l\'administrateur', 'X', snackbarConfigError);
        snackbarRef.afterDismissed()
          .subscribe(() => {
            console.error(error);
            this._changeDetector.detectChanges();
          });
      });
    if (!this.departementControl.value) { this.communeControl.disable(); }
  }

  /**
    * Behavior of field commune
   */
  disableCommune(departement) {
    if (this.communeControl.value) { this.communeControl.setValue(null); }

    if (departement && this.departementControl.valid) {
      this.communeControl.enable();

      this.dossierService.getCommuneBeneficiaire(this.departementControl.value.code)
        .subscribe((listCommunes) => {
          this.listCommune = listCommunes;
          if (this.listCommune.length < 1) { this.communeControl.disable(); }
          this.filteredCommune = GeneriqueListValeur.filtringList(this.listCommune, this.communeControl, this.communeValidatorKey, minSearchLength, 'commune');
        });
    } else { this.communeControl.disable(); }
  }

  /**
   * onLeave: Leave page without save the changes.
   */
  onLeave(): void {
    this.dialogRef.close(true);
  }

  /**
   * Management department value change
   */
  onBlurEventDepartement(departement) {
    if (this.departementControl.valid) {
      this.disableCommune(departement);
    }
  }

  displayCommune(commune): string | undefined {
    if (commune) {
      return `${commune.numInsee} - ${commune.nomCommune}`;
    }
  }

  onBlurEventSiren() {
    this.sirenControl.value && !this.sirenControl.hasError('pattern') ? this.nicControl.enable() : this.nicControl.disable();
  }

  /**
   * Managing the state of the search button
   */
  manageStatusButton() {
    const disableButtonSearch = this.nomControl.value || this.departementControl.value
      || this.communeControl.value || this.sirenControl.value || this.nicControl.value
      || this.numeroAgenceControl.value || this.inactifControl.value;

    return disableButtonSearch;
  }

  /**
   * onSearch: Recover form's values and search list of beneficiary
   */
  onSearch(critereRecherche: CritereSearchBeneficiaire): void {
    this.currentCritere = critereRecherche;
    this.dataOfTable = [];
    this.currentCritere.nbElemPerPage = this.pageSize;
    this.currentCritere.nom = this.nomControl.value ? this.nomControl.value.toUpperCase() : '';
    this.currentCritere.departement = this.departementControl.value ? this.departementControl.value : '';
    this.currentCritere.commune = this.communeControl.value ? this.communeControl.value : '';
    this.currentCritere.siren = this.sirenControl.value ? this.sirenControl.value : '';
    this.currentCritere.nic = this.nicControl.value ? this.nicControl.value : '';
    this.currentCritere.numeroAgence = this.numeroAgenceControl.value ? this.numeroAgenceControl.value.toUpperCase() : '';
    this.currentCritere.inactif = this.inactifControl.value ? this.inactifControl.value : false;
    this.dossierService.getResultatRechercheBeneficiaire(this.currentCritere).subscribe(
      (data) => {
        data.interlocuteurs.forEach(interlocuteur => {
          interlocuteur.actifLibelle = interlocuteur.actif ? 'Actif' : 'Inactif';
        });
        this.dataOfTable = data.interlocuteurs;
        this.nbTotalElements = data.nombreTotalElements;
        this.indexCurrentPage = this.currentCritere.pageAAficher - 1;
        this.loadDataSource();
      }
    );
    this.loadDataSource();
  }

  /**
   * Récupérer le numéro de la page courante
   * @param event Evenement émis par le paginateur, contiens le nombre d'éléments par page et le numéro index de la page courante.
   */
  getNumeroPage(event) {
    this.currentCritere.pageAAficher = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.onSearch(this.currentCritere);
  }

  /**
  * Init source and data with ouvrage
  */
  loadDataSource() {
    this.source.load(this.dataOfTable);
  }

  /**
   * Compare two communes
   * @param c1: first commune
   * @param c2: second commune
   */
  compareCommune(c1: Commune, c2: Commune): boolean {
    return c1 && c2 ? c1.numInsee === c2.numInsee : c1 === c2;
  }

  /**
  * Compare two departements
  * @param c1: first departement
  * @param c2: second departement
  */
  compareDepartement(c1: Departements, c2: Departements): boolean {
    return c1 && c2 ? c1.numero === c2.numero : c1 === c2;
  }

  displayDepartement(departement: Departements) {
    if (departement) {
      return `${departement.numero} - ${departement.nomDept}`;
    }
  }

  /**
  * Manages the user selection for a given row
  * @param row the row selected with its data
  */
  onTableRowClick(row: any) {
    if (this.data.beneficiaire) {
      this.data.beneficiaire.reference = row.data.reference;
      this.data.beneficiaire.raisonSociale = row.data.raisonSociale;
      this.data.beneficiaire.referenceBenef = row.data.reference;
    } else {
      this.data.beneficiaire = row.data;
    }
    this.dialogRef.close(false);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
