import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import MethodeGenerique from 'app/shared/methodes-generiques';
import { cloneDeep } from 'lodash';
import { LocalDataSource } from 'ng2-smart-table';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LabelTranslate } from '../../../../../../shared/label-translate.class';
import { Phase } from '../../../../create-dossier/create-dossier.interface';
import { ComponentViewRightMode, DossierService } from '../../../../dossiers.service';
import { Caracteristique, Operation } from '../../../dossier.interface';
import { ValeurImpactComponent } from '../impacts-ouvrage/valeur-impact/valeur-impact.component';
import { SearchPopupOuvrageComponent } from '../search-popup-ouvrage/search-popup-ouvrage.component';
import {
  ImpactOuvrages,
  Ouvrage,
  ParametreDonneeSpec,
  TypeOuvrage,
} from '../tableau-dynamique-ouvrage/tableau-dynamique-ouvrage.interface';
import { CaracteristiqueOuvrageDataSource } from './caracteristique-ouvrage-dataSource';




@Component({
  selector: 'siga-tableau-dynamique-ouvrage',
  templateUrl: './tableau-dynamique-ouvrage.component.html',
  styleUrls: ['./tableau-dynamique-ouvrage.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TableauDynamiqueOuvrageComponent extends ComponentViewRightMode implements OnInit, OnChanges {

  ouvragefReadySubscription: Subscription = null;
  @Input() currentOperation: Operation;
  @Output() isFormOuvrageValid: EventEmitter<any> = new EventEmitter();
  @Output() isEditImpactEvent: EventEmitter<any> = new EventEmitter();


  private unsubscribe = new Subject<void>();

  /**
   * Settings
   */
  settings: any = { actions: false };

  /**
   * Message to display when there is a wrong input
   */
  messageToDisplay = '';

  /**
   * Manage state of button add
   */
  stateButtonAdd = false;

  /**
   * ExpandedElement
   */
  expandedElement: any;

  /**
   * boolean to check to expand up or down
   */
  expanded = false;

  /**
   * boolean if true => disable action (add, delete ouvrage)
   */
  desactiveActionOuvrage: boolean;

  /**
   * Types ouvrages
   */
  @Input() typesOuvrages: TypeOuvrage[];

  /**
   * get type  ouvrage where it's selected
   */
  selected: TypeOuvrage = null;

  isErrorInImpact = false;

  isNoErrorInImpact = false;

  impactsListe: ImpactOuvrages[] = [];

  /**
   * FormOuvrage
   */
  formOuvrage: FormGroup;

  /**
   * value of type ouvrage
   */
  public value: TypeOuvrage;

  /**
   * Columns of table
   */
  displayedColumns = ['actionsColumn', 'type', 'numero', 'search', 'intitule', 'libelleEtat', 'suppression'];

  /**
   * datasource
   */
  dataSource = new CaracteristiqueOuvrageDataSource(this.dossierService.elementDataOuvrage);

  /**
   * Array of detail row
   */
  explansionDetialRowCollection = new Array<any>();

  /**
   * Array of phase
   */
  phases: Phase[];

  /*************** Ajout pour impact ************/
  labelTranslate: LabelTranslate;

  /************* fin ajout pour impact */

  get typeOuvrageControl() { return this.formOuvrage.get('typeOuvrage') };
  get codeAgenceControl() { return this.formOuvrage.get('codeAgence') };
  // get typeOuvrageControl() { return this.formOuvrage.get('typeOuvrage') };
  // get codeAgenceControl() { return this.formOuvrage.get('codeAgence') };

  constructor(
    private _formBuilder: FormBuilder,
    private dossierService: DossierService,
    public dialog: MatDialog,

    /****** Ajout pour impact *******/
    private translate: TranslateService) {

    super(dossierService);

    /******* Ajout pour impact ******/
    this.labelTranslate = new LabelTranslate(this.translate);
  }

  /**
   * ng oninit
   */
  ngOnInit() {
    //  setTimeout(() => {
    this.phases = this.dossierService.getPhases();
    // check phase : if phase > T15 => disable action (add, delete) ouvrage
    if (this.dossierService.dossier && this.dossierService.dossier.phase) {
      this.desactiveActionOuvrage = MethodeGenerique.isPhase1SupPhase2(this.phases, this.dossierService.dossier.phase, 'T15');
    }
    //  }, this.dossierService.delay);

    this.formOuvrage = this._formBuilder.group({
      typeOuvrage: [],
      codeAgence: []
    });
    this.dossierService.elementDataOuvrage = [];
    this.loadCurrentOperation(this.currentOperation);
    if (this.currentOperation) {
      if (this.currentOperation.ouvrageNatureOperation) {
        this.currentOperation.ouvrageNatureOperation.forEach(ouvrage => {
          ouvrage.disable = true;
          this.ajoutImpactOuvrage(ouvrage)
        })
      }
    }
    this.loadDataSource();
    this.typesOuvrages = this.dossierService.getTypeOuvrage();

  }

  searchErrorImpacts() {
    let rowData2;
    let isError = false;
    if (this.currentOperation.ouvrageNatureOperation) {
      this.currentOperation.ouvrageNatureOperation.forEach(ouvrage => {
        rowData2 = ouvrage.impactOuvrages.find(row => row.erreurValeur === true);
        if (rowData2) {
          this.messageToDisplay = this.labelTranslate.translateCodeWithParamsToLabel('messages.impact.erreurGeneriqueImpact');
          isError = true;
        }
      })
      this.isErrorInImpact = isError || this.currentOperation.ouvrageError;
      this.stateButtonAdd = this.isErrorInImpact;
      this.currentOperation.enableMessageError = this.isErrorInImpact;
      this.notifyCheckParentComponent(!this.isErrorInImpact);
    }
  }

  /**
   * Sends back the updated form to the parent component to manage validation
   *  @param valid it is true whene the form is valid
  */
  notifyCheckParentComponent(valid?: boolean) {
    this.isFormOuvrageValid.emit(valid);
  }

  /**
     * Manage message error + notify parent
     * @param valeur : true enable message error + disable button valid update dossier
     */
  onManageMessageError(valeur) {
    // Variable pour determiner s'il y a des erreurs, a true s'il n'y a pas de ligne incorrecte
    let erreurOk = true;
    if (!valeur) {
      // Gestion des erreurs
      this.currentOperation.ouvrageNatureOperation.forEach(element => {
        if ((!element.disable && element.hasError) || (!element.libelle || !element.typeOuvrage)) {
          erreurOk = false;
        }
      });
    }

    if (erreurOk) {
      this.currentOperation.enableMessageError = valeur;
      this.currentOperation.ouvrageError = valeur;
      this.stateButtonAdd = valeur;
      this.notifyCheckParentComponent(!valeur);
      if (!this.stateButtonAdd) {
        this.messageToDisplay = '';
      }
    } else {
      this.stateButtonAdd = true;
      this.notifyCheckParentComponent(true);
    }
  }

  /**
  * Load information for the current operation
  * @param currentOperation
  */
  loadCurrentOperation(currentOperation) {
    if (currentOperation) {
      this.dossierService.elementDataOuvrage = currentOperation.ouvrageNatureOperation;
      this.loadDataSource();
    }
  }


  /**
   * ng onchanges
   */
  ngOnChanges() {
    this.dossierService.elementDataOuvrage = [];
    this.loadCurrentOperation(this.currentOperation);
    if (this.currentOperation) {
      if (this.currentOperation.ouvrageNatureOperation) {
        this.currentOperation.ouvrageNatureOperation.forEach(ouvrage => {
          if (ouvrage.libelle === '' || ouvrage.hasError) {
            ouvrage.disable = false;
            this.messageToDisplay = 'Veuillez saisir le type et le numéro.'
          } else {
            ouvrage.disable = true;
          }
          this.ajoutImpactOuvrage(ouvrage)

        })
      }
    }
    this.loadDataSource();
    this.manageAddButtonState();
    // check phase : if phase > T15 => disable action (add, delete) ouvrage
    if (this.dossierService.dossier && this.dossierService.dossier.phase) {
      this.desactiveActionOuvrage = MethodeGenerique.isPhase1SupPhase2(this.phases, this.dossierService.dossier.phase, 'T15');
    }

  }

  /**
   * load data source
   */
  loadDataSource() {
    this.dataSource = new CaracteristiqueOuvrageDataSource(this.dossierService.elementDataOuvrage);
  }

  /**
    * Event when a type ouvrage is selected
    * @param value TYpeOuvrage
    * @param row Ouvrage
    */
  change(row: any) {
    const code: string = row.codeAgence;
    const value = row.typeOuvrage;
    if (row['codeAgence'] !== '') {
      if (!this.checkOuvrage(row)) {
        this.dossierService.getOuvrage(row.typeOuvrage.code, row.codeAgence)
          .subscribe((ouvrageResult: any) => {
            row['libelle'] = ouvrageResult.libelle;
            row['typeOuvrage'] = value;
            row['disable'] = true;
            row['codeAgence'] = code;
            row['libelleEtat'] = ouvrageResult.libelleEtat;
            row['caracteristiqueOuvrage'] = ouvrageResult.listCaracteristiqueOuvrage;
            const source = new LocalDataSource();
            source.load(ouvrageResult.listCaracteristiqueOuvrage)
            row['source'] = source;
            row['settings'] = this.initCaracteristiqueOuvrageTable(ouvrageResult.listCaracteristiqueOuvrage, source);
            this.currentOperation.localisationPertinente = true;
            this.value = null;
            // S' il y a des erreurs
            this.hasErrorOuvrages();
            this.onManageMessageError(false);

            /************ ajout pour impacts:  Les données impacts de l'ouvrage *************/
            row['impactOuvrages'] = ouvrageResult.impactOuvrages;
            const sourceImpacts = new LocalDataSource();
            if (!ouvrageResult.impactOuvrages) {
              sourceImpacts.load([]);
            } else {
              sourceImpacts.load(ouvrageResult.impactOuvrages);
            }
            row['sourceImpacts'] = sourceImpacts;
            row['settingsImpacts'] = this.initOuvrageImpactsTable(ouvrageResult.impactOuvrages, sourceImpacts);
            /*************************** fin ajout pour impacts *****************************/

          },
            (error) => {
              this.messageToDisplay = `Ouvrage inconnu: ${row['codeAgence']} !`;
              this.onManageMessageError(true);

            });
      } else {
        this.messageToDisplay = `Au moins un ouvrage de même numéro est déjà associé à cette nature d'opération.`;
        this.onManageMessageError(true);
        row['disable'] = false;
        row['hasError'] = true;

      }
    }
  }

  ajoutImpactOuvrage(ouvrage) {
    ouvrage.expanded = false;
    const source = new LocalDataSource();
    source.load(ouvrage.caracteristiqueOuvrage);
    ouvrage.source = source;

    /******* ajout pour impacts:  Les données des impacts de l'ouvrage ********/
    const sourceImpacts = new LocalDataSource();
    if (!ouvrage.impactOuvrages) {
      sourceImpacts.load([]);
    } else {
      sourceImpacts.load(ouvrage.impactOuvrages);
    }
    ouvrage.sourceImpacts = sourceImpacts;
    ouvrage.settingsImpacts = this.initOuvrageImpactsTable(ouvrage.impactOuvrages, sourceImpacts);
    /********************* fin ajout pour impacts ****************************/

    ouvrage.settings = this.initCaracteristiqueOuvrageTable(ouvrage.caracteristiqueOuvrage, source);
  }


  /**
  * Event add a new row in table
  */
  addOuvrage() {
    this.messageToDisplay = 'Veuillez saisir le type et le numéro.';
    const typeOuvrage: TypeOuvrage = {
      id: null,
      code: '',
      codeParam: '',
      libelleParam: '',
      libelle: '',
      texte: ''
    };
    const listeCaracteristique: Caracteristique[] = [{
      code: '',
      libelle: '',
      typeDonnee: '',
      valeur: ''
    }];
    const paremetreDonneeSpec: ParametreDonneeSpec = {
      id: null,
      typeDiscriminant: '',
      codeDiscriminant: '',
      codeParam: '',
      label: '',
      typeDonnee: '',
      tailleDonnee: null,
      codeListe: '',
      noOrdre: null

    }
    const listImpact: ImpactOuvrages[] = [{
      id: null,
      parametreDonneeSpec: paremetreDonneeSpec,
      valeurDate: '',
      valeurString: '',
      valeurInteger: '',
      valeurDouble: '',
      valeurListe: '',
      erreurValeur: false

    }];

    const newOuvrage: Ouvrage = {
      id: null,
      typeOuvrage,
      codeAgence: '',
      libelle: '',
      libelleEtat: '',
      disable: false,
      expanded: false,
      caracteristiqueOuvrage: listeCaracteristique,
      settings: null,
      source: null,
      sourceImpacts: null,
      impactOuvrages: listImpact,
      settingsImpacts: null,

      masseEaux: []
    };
    this.value = null;
    this.dossierService.elementDataOuvrage.push(newOuvrage);
    this.stateButtonAdd = true;
    this.dataSource = new CaracteristiqueOuvrageDataSource(this.dossierService.elementDataOuvrage);
    this.onManageMessageError(true);
  }


  /**
   * manage state button add bouton
   */
  manageAddButtonState() {
    if (this.currentOperation) {
      if (this.currentOperation.enableMessageError) {
        this.stateButtonAdd = true;
      } else {
        this.stateButtonAdd = false;
      }
    }
  }

  /**
   * event to delete a row (ouvrage) from a table
   */
  deleteRow(row) {
    const elementData: Ouvrage[] = cloneDeep(this.dossierService.elementDataOuvrage);
    elementData.splice(this.dossierService.elementDataOuvrage.indexOf(row), 1);
    this.dossierService.elementDataOuvrage = elementData;
    this.currentOperation.ouvrageNatureOperation = this.dossierService.elementDataOuvrage;
    this.onManageMessageError(false);
    this.loadCurrentOperation(this.currentOperation);
    this.dataSource = new CaracteristiqueOuvrageDataSource(this.dossierService.elementDataOuvrage);
  }

  /**
   * Event to expand more or expand less the detail of ouvrage
   */
  toggleDetailsRow(row: Ouvrage): void {
    if (row['expanded'] === true) {
      this.expanded = false;
    } else {
      this.expanded = true;
    }
    row['expanded'] = this.expanded;

  }

  /**
   * initialisation table caracteristique ng2smart table
   * @param caracteristique
   * @param source
   */
  initCaracteristiqueOuvrageTable(caracteristique: Caracteristique[], source: LocalDataSource): any {
    return {
      actions: false,
      pager: false,
      hideSubHeader: true,
      noDataMessage: 'aucune caractéristique',
      columns: {
        libelle: {
          title: 'Caractéristiques',
          width: '45%',
          filter: false,
          addable: false,
        },
        valeur: {
          title: 'Valeurs',
          width: '55%',
          filter: false,
          addable: false,
        },
      },
    };
  }

  /**
   * update row
   */
  updateRow(row) {
    this.dossierService.getOuvrage(row.typeOuvrage.code, row.codeAgence)
      .subscribe((ouvrageResult: any) => {
        row['libelle'] = ouvrageResult.libelle;
        row['libelleEtat'] = ouvrageResult.libelleEtat;
        row['disable'] = true;
        row['codeAgence'] = row.codeAgence;
        row['caracteristiqueOuvrage'] = ouvrageResult.listCaracteristiqueOuvrage;
        row['impactOuvrages'] = ouvrageResult.impactOuvrages;
        this.value = null;
      },
        (error) => {
          this.onManageMessageError(true);
          this.messageToDisplay = `Ouvrage inconnu: ${row['codeAgence']} !`;
        });
  }

  /**
  * Event onblur
  * @param row Ouvarge
  */
  onBlur(row) {
    if (row.typeOuvrage.code && row.codeAgence) {
      if (!this.checkOuvrage(row)) {
        this.dossierService.getOuvrage(row.typeOuvrage.code, row.codeAgence)
          .subscribe((ouvrageResult: any) => {
            row['libelle'] = ouvrageResult.libelle;
            row['libelleEtat'] = ouvrageResult.libelleEtat;
            row['disable'] = true;
            row['hasError'] = false;
            row['codeAgence'] = row.codeAgence;
            row['caracteristiqueOuvrage'] = ouvrageResult.listCaracteristiqueOuvrage;
            const source = new LocalDataSource();
            source.load(ouvrageResult.listCaracteristiqueOuvrage)
            row['source'] = source;
            row['settings'] = this.initCaracteristiqueOuvrageTable(ouvrageResult.listCaracteristiqueOuvrage, source);
            this.currentOperation.localisationPertinente = true;
            this.value = null;
            this.hasErrorOuvrages();

            /********** Ajout pour impacts:  Les données impacts de l'ouvrage ***********/
            row['impactOuvrages'] = ouvrageResult.impactOuvrages;
            const sourceImpacts = new LocalDataSource();
            if (!ouvrageResult.impactOuvrages) {
              sourceImpacts.load([]);
            } else {
              sourceImpacts.load(ouvrageResult.impactOuvrages);
            }
            row['sourceImpacts'] = sourceImpacts;
            row['settingsImpacts'] = this.initOuvrageImpactsTable(ouvrageResult.impactOuvrages, sourceImpacts);

            /************************ fin ajout impact **********************************/
          },
            (error) => {
              this.onManageMessageError(true);
              this.messageToDisplay = `Ouvrage inconnu: ${row['codeAgence']} !`;
            });
      } else {
        this.onManageMessageError(true);
        this.messageToDisplay = `Au moins un ouvrage de même numéro est déjà associé à cette nature d'opération.`;
        row['disable'] = false;
        row['hasError'] = true;
      }
    } else {
      this.onManageMessageError(true);
      this.messageToDisplay = 'Veuillez saisir le type et le numéro.';

    }
  }

  /**
   * Improve the Angular perf
   * @param index list index
   * @param item list item
   */
  trackById(index, item) {
    return item.id;
  }

  /**
   * Filter liste table ouvrage
   */
  checkOuvrage(row): boolean {
    let result = false;
    let indice = 0;
    this.currentOperation.ouvrageNatureOperation.forEach(ouvrage => {
      if (ouvrage.codeAgence === row['codeAgence'] && ouvrage.typeOuvrage.code === row['typeOuvrage'].code) {
        indice = indice + 1;
      }
    })
    if (indice === 1) {
      result = false
    } else if (indice > 1) {
      return true;
    } else {
      result = false;
    }
    return result;
  }

  /**
   * Filter liste table ouvrage
   */
  checkExistenceOuvrage(row): boolean {
    let result = false;
    this.currentOperation.ouvrageNatureOperation.forEach(ouvrage => {
      if (ouvrage.codeAgence === row['codeAgence'] && ouvrage.typeOuvrage.code === (row['typeOuvrage'] ? row['typeOuvrage'].code : row['typeAgence'])) {
        result = true;
      }
    })

    return result;
  }

  /**
   * Search Ouvrage
   */
  searchOuvrage(row: Ouvrage) {
    const matDialogRef = this.openSearchOuvrageDialog();
    // Le tableau d'ouvrage pour la recherche
    const listOuvrageSearch: Ouvrage[] = [];

    matDialogRef.beforeClosed().pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (result: boolean) => {
        });
    matDialogRef.afterClosed().subscribe(
      res => {
        if (res === false) {
          // Suppression des données vides dans elementDataOuvrage du service
          this.dossierService.elementDataOuvrage.forEach(rowOuvrage => {
            if (rowOuvrage === row) {
              this.deleteRow(rowOuvrage);
            }
          });

          // Recuperation des ouvrages resultant de la recherche
          matDialogRef.componentInstance.ouvragesSelectedData.forEach(ouvrage => {
            const ouvrageResult = this.ouvrageApresSearch(ouvrage);
            if (ouvrageResult.typeOuvrage) {
              if (this.checkExistenceOuvrage(ouvrage)) {
                this.messageToDisplay = `Au moins un ouvrage de même numéro est déjà associé à cette nature d'opération.`;
                this.onManageMessageError(true);
                ouvrageResult.disable = false;
                ouvrageResult.hasError = true;
              }
              listOuvrageSearch.push(ouvrageResult);
            }
          });

          // Si la
          if (this.currentOperation) {
            if (this.currentOperation.ouvrageNatureOperation) {
              listOuvrageSearch.forEach(ouvrage => {
                this.currentOperation.ouvrageNatureOperation.push(ouvrage);
              })
            } else {
              this.currentOperation.ouvrageNatureOperation = listOuvrageSearch;
            }
          }
          this.loadDataSource();
        }
      }
    );
  }


  /**
   * Retourne un ouvrage avec ces données
   * après une recherche d'ouvrage(multi-sélection)
   *
   * @param ouvrage
   */
  ouvrageApresSearch(ouvrage: any): Ouvrage {
    // Le nouvel ouvrage
    const ouv: Ouvrage = {
      id: null,
      typeOuvrage: null,
      codeAgence: '',
      libelle: '',
      libelleEtat: '',
      caracteristiqueOuvrage: [],
      masseEaux: [],
      disable: null,
      expanded: null,
      settings: '',
      source: null
    };
    // Load du source des caracteristiques
    const source = new LocalDataSource();
    source.load(ouvrage.listCaracteristiqueOuvrage);

    // Recherche du type d'ouvrage
    this.typesOuvrages.forEach(typeOuv => {
      if (typeOuv.code === ouvrage.typeAgence) {
        ouv.typeOuvrage = typeOuv;
      }
    });

    ouv.codeAgence = ouvrage.codeAgence;
    ouv.libelle = ouvrage.libelle;
    ouv.libelleEtat = ouvrage.libelleEtat;
    ouv.masseEaux = ouvrage.masseEaux;
    ouv.caracteristiqueOuvrage = ouvrage.listCaracteristiqueOuvrage;
    ouv.source = source;
    ouv.disable = true;
    ouv.hasError = false;
    ouv.expanded = false;
    ouv.settings = this.initCaracteristiqueOuvrageTable(ouvrage.listCaracteristiqueOuvrage, source);

    ouv.impactOuvrages = ouvrage.impactOuvrages;
    const sourceImpacts = new LocalDataSource();
    if (!ouvrage.impactOuvrages) {
      sourceImpacts.load([]);
    } else {
      sourceImpacts.load(ouvrage.impactOuvrages);
    }
    ouv.sourceImpacts = sourceImpacts;
    ouv.settingsImpacts = this.initOuvrageImpactsTable(ouvrage.impactOuvrages, sourceImpacts);
    return ouv;
  }

  /**
   * Configures Material Dialog of search beneficiary
   */
  openSearchOuvrageDialog(): MatDialogRef<SearchPopupOuvrageComponent> {
    const config = new MatDialogConfig();
    config.width = '90%';
    config.disableClose = true;
    config.autoFocus = false;
    config.data = '';
    return this.dialog.open(SearchPopupOuvrageComponent, config);
  }

  displayType(type): string | undefined {
    if (type) {
      return `${type.code}`;
    }
  }


  /**
   * allows to compare two objects
   * @param compareItem1;
   * @param compareItem2;
   */
  compareListElement(compareItem1: any, compareItem2: any) {
    return compareItem1 && compareItem2 && compareItem1.id === compareItem2.id;
  }
  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');

  /**
   * Check if there are error in data ouvrage
   */
  hasErrorOuvrages() {
    let okHasError = false;
    this.currentOperation.ouvrageNatureOperation.forEach(ouvrage => {
      if (ouvrage.hasError === true && ouvrage.disable === false) {
        okHasError = true;
      }
    });

    // S'il y a des erreurs sur les autres lignes d'ouvrage
    if (okHasError) {
      this.messageToDisplay = `Au moins un ouvrage de même numéro est déjà associé à cette nature d'opération.`;
      this.onManageMessageError(true);
    } else {
      this.messageToDisplay = '';
      this.onManageMessageError(false);
    }
  }

  /****************** Ajout pour impact ************************/
  /**
   * initialisation table impact ng2smart table
   *
   */
  initOuvrageImpactsTable(impactOuvrage: ImpactOuvrages[], source: LocalDataSource) {
    return {
      actions: false,
      pager: {
        display: false
      },
      hideSubHeader: true,
      noDataMessage: this.labelTranslate.translateCodeInLabel('messages.impact.noData'),
      columns: {
        parametreDonneeSpec: {
          title: 'Impacts',
          width: '45%',
          valuePrepareFunction: (value) => {
            return value.label;
          },
          filter: false,
          addable: false,
        },
        valeur: {
          title: 'Valeurs',
          width: '55%',
          filter: false,
          addable: false,
          type: 'custom',
          renderComponent: ValeurImpactComponent,
          onComponentInitFunction: (instance) => {

            instance.ErrorMessageImpact.subscribe(value => {
              this.searchErrorImpacts();
            });

            instance.editionMessageImpact.subscribe(value => {
              this.isEditImpactEvent.emit(value);
            })
          }
        },
      },
    };
  }

  /****************************** fin ajout impact ************************/
}
