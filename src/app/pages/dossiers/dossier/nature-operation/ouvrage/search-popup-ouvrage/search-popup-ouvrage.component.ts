import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import {
  TypeOuvrage,
} from 'app/pages/dossiers/dossier/nature-operation/ouvrage/tableau-dynamique-ouvrage/tableau-dynamique-ouvrage.interface';
import { BenefRegex, Departements } from 'app/pages/dossiers/dossiers.interface';
import { ComponentViewRightMode, DossierService } from 'app/pages/dossiers/dossiers.service';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import MethodeGenerique, { minSearchLength } from 'app/shared/methodes-generiques';
import { SearchPopupInterlocuteurComponent } from 'app/shared/search-popup/search-popup-interlocuteur.component';
import { getErrorMessage, noDataMessage } from 'app/shared/shared.retourApi';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { LocalDataSource } from 'ng2-smart-table';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Beneficiaire } from '../../../../create-dossier/create-dossier.interface';
import { Communes } from '../../../dossier.interface';
import { CheckboxOuvrageCellComponent } from './checkboxOuvrageCell/checkboxOuvrageCell.component';
import { CritereSearchOuvrage, EtatOuvrage } from './search-popup-ouvrage.interface';


@Component({
  templateUrl: './search-popup-ouvrage.component.html',
  styleUrls: ['./search-popup-ouvrage.component.scss'],
})
export class SearchPopupOuvrageComponent extends ComponentViewRightMode implements OnInit, OnDestroy {

  /**
   * Critère courant
   */
  currentCritere: CritereSearchOuvrage;

  /**
   * Nombre total des éléments correspondants à la recherche
   */
  nbTotalElements: number;

  /**
   * Nombre maximal d'élément par page
   */
  pageSize = 15;

  maValeur: string = '';
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
  dataOfTable: CritereSearchOuvrage[] = [];

  /**
   * List of commune
   */
  listCommune: Communes[] = [];

  /**
   * List of department
   */
  listDepartement: Departements[] = [];

  /**
  * value of unsubcribe
  */
  private unsubscribe = new Subject<void>();

  message: string;

  /**
   * Type ouvrage
   */
  typeOuvrage: TypeOuvrage[] = [];
  filteredType: Observable<TypeOuvrage[]>;
  readonly typeValidatorKey = 'typeOuvrageNotFound';

  etatOuvrage: EtatOuvrage[] = [];
  filteredEtat: Observable<EtatOuvrage[]>;
  readonly etatValidatorKey = 'etatOuvrageNotFound';

  filteredDepartement: Observable<Departements[]>;
  readonly departementValidatorKey = 'departementNotFound';

  filteredCommune: Observable<Communes[]>;
  readonly communeValidatorKey = 'communeNotFound';

  /**
   * Data ouvrage selected in table
   */
  ouvragesSelectedData: any[] = [];


  /**
   * Initialisation of result table
   */
  settings = {
    actions: false,
    noDataMessage,
    hideSubHeader: true,
    columns: {
      checked: {
        title: '',
        type: 'custom',
        renderComponent: CheckboxOuvrageCellComponent,
        onComponentInitFunction: (instance) => {
          instance.editApplicationEvent.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
            this.onTableRowClick(instance);
          });
        }
      },
      typeAgence: {
        title: 'Type',
        type: 'txt',
        filter: false,
        width: '10%'
      },
      codeAgence: {
        title: 'Numéro',
        type: 'txt',
        filter: false,
        width: '20%'
      },
      libelle: {
        title: 'Intitulé',
        type: 'txt',
        filter: false,
        width: '60%',
      },
      libelleEtat: {
        title: 'Etat',
        type: 'txt',
        filter: false,
        width: '10%',
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
  get maitreOuvrageControl() { return this.formSearchPopup.get('maitreOuvrage'); }
  get libelleOuvrageControl() { return this.formSearchPopup.get('libelleOuvrage'); }
  get departementControl() { return this.formSearchPopup.get('departement'); }
  get communeControl() { return this.formSearchPopup.get('commune'); }
  get typeControl() { return this.formSearchPopup.get('type'); }
  get etatControl() { return this.formSearchPopup.get('etat'); }
  get libelleControl() { return this.formSearchPopup.get('libelle'); }
  /**
   * Constructor of component
   * @param data: data of dossier passed in parameter
   * @param dialogRef: reference of object dialog
   * @param translate
   * @param dossierService: Service's file of application
   * @param _formBuilder
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<SearchPopupOuvrageComponent>,
    public translate: TranslateService,
    public dossierService: DossierService,
    private _formBuilder: FormBuilder,
    public dialog: MatDialog
  ) {
    super(dossierService);
  }


  /**
   * Initialisation of component
   */
  ngOnInit(): void {
    this.formSearchPopup = this._formBuilder.group({
      maitreOuvrage: [null, [Validators.maxLength(9), Validators.pattern(BenefRegex)]],
      libelleOuvrage: [{ value: null, disabled: true }, []],
      type: [null, []],
      etat: [null, []],
      departement: [null, []],
      commune: [null, []],
      libelle: [null]
    });

    this.initialisationPage();
  }

  /**
    * Init search criteria fields
   */
  initialisationPage() {

    this.typeOuvrage = this.dossierService.getTypeOuvrage();
    this.filteredType = GeneriqueListValeur.filtringList(this.typeOuvrage, this.typeControl, this.typeValidatorKey, minSearchLength, 'listValeur');

    this.dossierService.getEtatOuvrage().subscribe((listeEtat) => {
      this.etatOuvrage = listeEtat;
      this.filteredEtat = GeneriqueListValeur.filtringList(this.etatOuvrage, this.etatControl, this.etatValidatorKey, minSearchLength, 'listValeur');
    });

    this.dossierService.getDepartements().pipe(takeUntil(this.unsubscribe)).subscribe((list) => {
      this.listDepartement = list;
      this.listDepartement.sort(MethodeGenerique.sortingDepartement);
      this.filteredDepartement = GeneriqueListValeur.filtringList(this.listDepartement, this.departementControl, this.departementValidatorKey, minSearchLength, 'departement');

      this.departementControl.valueChanges.subscribe((dept) => {
        this.disableCommune(dept);
      });
    });

    if (!this.departementControl.value) { this.communeControl.disable(); }

    this.resetLibelleMaitreOuvrage();
  }

  /**
   * manage reset "LibelleMaitreOuvrage" field with "MaitreOuvrage" field value
   */
  resetLibelleMaitreOuvrage() {
    this.maitreOuvrageControl.valueChanges.subscribe((maitre) => {
      if (!this.maitreOuvrageControl.value || !this.maitreOuvrageControl.valid) {
        this.libelleOuvrageControl.reset();
      }
    })
  }

  /**
    * Behavior of field commune
   */
  disableCommune(departement) {
    if (this.communeControl.value) { this.communeControl.setValue(null); }

    if (departement && this.departementControl.valid) {
      this.communeControl.enable();

      const listDepartement: Departements[] = [];
      listDepartement.push(departement);

      this.dossierService.getCommunes(listDepartement).pipe(takeUntil(this.unsubscribe))
        .subscribe((listCommunes) => {
          this.listCommune = listCommunes;
          if (this.listCommune.length < 1) { this.communeControl.disable(); }
          this.filteredCommune = GeneriqueListValeur.filtringList(this.listCommune, this.communeControl, this.communeValidatorKey, minSearchLength, 'commune');
        });
    } else { this.communeControl.disable(); }
  }

  /**
   * onLeave: Leave page without save the changes
   */
  onLeave(): void {
    this.dialogRef.close(true);
  }

  /**
   * search 'Interlocuteur' with code
   * @param maitreOuvrage
   */
  onBlurMaitreOuvrage(maitreOuvrage) {
    this.message = null;

    if (this.maitreOuvrageControl.value && this.maitreOuvrageControl.valid) {
      this.dossierService.getBeneficaire(maitreOuvrage.toUpperCase()).pipe(takeUntil(this.unsubscribe)).subscribe((interlocuteur) => {

        if (interlocuteur) {
          this.maitreOuvrageControl.setValue(interlocuteur.reference);
          this.libelleOuvrageControl.setValue(interlocuteur.raisonSociale);
          if (!interlocuteur.actif) {
            this.maitreOuvrageControl.setErrors({ 'interlocuteurInactif': true });
          }
        }
      },
        (error: HttpErrorResponse) => {
          this.maitreOuvrageControl.setErrors({ 'interlocuteurNotFound': true });
          this.message = getErrorMessage(error);

        });
    }
  }

  /**
   * Management department value change
   */
  onBlurEventDepartement(departement) {
    if (this.departementControl.valid) {
      this.disableCommune(departement);
    }
  }

  displayTypeOuvrage(type: TypeOuvrage): string | undefined {
    if (type) {
      return `${type.code}`;
    }
  }

  displayDepartement(departement: Departements): string | undefined {
    if (departement) {
      return `${departement.numero} - ${departement.nomDept}`;
    }
  }

  displayCommune(commune): string | undefined {
    if (commune) {
      return `${commune.numInsee} - ${commune.nomCommune}`;
    }
  }

  displayEtat(etat): string | undefined {
    if (etat) {
      return `${etat.libelle}`;
    }
  }

  /**
   * onSearch: Recover form's values and search list of beneficiary
   */
  onSearch(critereRecherche: CritereSearchOuvrage): void {
    this.currentCritere = critereRecherche;

    this.dataOfTable = [];

    this.currentCritere.nbElemPerPage = this.pageSize;
    this.currentCritere.maitreOuvrage = this.maitreOuvrageControl.value ? this.maitreOuvrageControl.value.toUpperCase() : '';
    this.currentCritere.departement = this.departementControl.value ? this.departementControl.value : '';
    this.currentCritere.commune = this.communeControl.value ? this.communeControl.value : '';
    this.currentCritere.typeOuvrage = this.typeControl.value ? this.typeControl.value : '';
    this.currentCritere.etat = this.etatControl.value ? this.etatControl.value : '';
    this.currentCritere.libelle = this.libelleControl.value ? this.libelleControl.value : '';
    this.dossierService.getResultatRechercheOuvrage(this.currentCritere).subscribe(
      (data) => {
        this.dataOfTable = data.ouvrages;
        this.nbTotalElements = data.nombreTotalElements;
        this.indexCurrentPage = this.currentCritere.pageAAficher - 1;
        this.loadDataSource();
      }
    );
    this.ouvragesSelectedData = [];
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
    if (!this.dataOfTable) {
      this.dataOfTable = [];
    }
    this.source.load(this.dataOfTable);
  }

  /**
  * Manages the user selection for a given row
  * @param instance the instance component check selected with its data
  */
  onTableRowClick(instance: any) {
    if (instance.value) {
      // Ajouter dans la liste des cochés
      this.ouvragesSelectedData.push(instance.rowData);
    } else {
      // Si la ligne contient contient des données
      if (instance.rowData) {
        // supprimer dans la liste des cochés
        this.filterListeOuvrageSelectionnes(instance.rowData.codeAgence, instance.rowData.typeAgence);
      }
    }
  }

  /**
   * Open popup of search  beneficiary ("Maitre d'ouvrage")
   */
  searchMaitreOuvrage() {
    const matDialogRef = this.openSearchMaitreOuvrageDialog();
    matDialogRef.beforeClosed().pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (result: boolean) => {
          if (result) {
            this.libelleOuvrageControl.markAsPristine();
          }
        });
    matDialogRef.afterClosed().subscribe(
      result => {
        this.maitreOuvrageControl.setValue(matDialogRef.componentInstance.data.beneficiaire.reference);
        this.libelleOuvrageControl.setValue(matDialogRef.componentInstance.data.beneficiaire.raisonSociale);
      }
    );
  }

  /**
    * Configures Material Dialog of search beneficiary
    */
  openSearchMaitreOuvrageDialog(): MatDialogRef<SearchPopupInterlocuteurComponent> {
    const config = new MatDialogConfig();
    config.width = '90 %';
    config.autoFocus = false;
    config.disableClose = true;
    // initialisation et affectation du titre dynamique
    const benef: Beneficiaire = {
      raisonSociale: '',
      reference: '',
      actif: null,
      actifLibelle: null,
      status: null,
      address: null,
      commune: null
    }
    config.data = { beneficiaire: benef, title: 'Recherche Maître d\'ouvrage' };
    return this.dialog.open(SearchPopupInterlocuteurComponent, config);
  }

  /**
   * Permet de supprimer une ligne d'ouvrage
   * dans ouvragesSelectedData décochée dans la table
   *
   * @param codeAgence Le code agence d'ouvrage
   * @param typeAgence Le type agence d'ouvrage
   */
  filterListeOuvrageSelectionnes(codeAgence: string, typeAgence: string) {
    this.ouvragesSelectedData.forEach(ouvrage => {
      if (ouvrage.codeAgence === codeAgence && ouvrage.typeAgence === typeAgence) {
        this.ouvragesSelectedData.splice(this.ouvragesSelectedData.indexOf(ouvrage), 1);
      }
    });
  }

  /**
   * Managing the state of the search button
   */
  manageStatusButton() {
    if ((this.maitreOuvrageControl.value && this.libelleOuvrageControl.value)
      ||
      (
        this.departementControl.value
        || this.communeControl.value
        || this.typeControl.value
        || this.etatControl.value
        || this.libelleControl.value
      )) {
      return true
    } else {
      return false
    }
  }

  /**
   * Managing the state of the valid button
   * Return true if the button should be disabled and false if not
   */
  manageValidButton() {
    if ((this.manageStatusButton() && this.ouvragesSelectedData.length > 0)
      || !this.formSearchPopup.valid
      || this.maitreOuvrageControl.hasError('pattern')) {
      return false
    } else {
      return true
    }
  }

  /**
   * Event function for valid search
   */
  onValidSearch() {
    this.data = this.ouvragesSelectedData;
    this.dialogRef.close(false);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}

