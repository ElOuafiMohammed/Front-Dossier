import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MasseEau, Operation } from 'app/pages/dossiers/dossier/dossier.interface';
import { LabelTranslate } from 'app/shared/label-translate.class';
import { verifierLocalisationPertinenteErreur } from 'app/shared/methodes-generiques';
import { getErrorMessage, noMasseDeauMessage } from 'app/shared/shared.retourApi';
import { concat, differenceBy, unionBy } from 'lodash';
import { LocalDataSource } from 'ng2-smart-table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import NumberUtils from '../../../../../../shared/utils/number-utils';
import { ComponentViewRightMode, DossierService } from '../../../../dossiers.service';
import { ActionsTableauMasseEauComponent } from './actions-tableau/actions-tableau.component';
import { CodeMasseEauCellComponent } from './code-masse-eau-cell/code-masse-eau.component-cell';

@Component({
  selector: 'siga-app-masse-eau',
  templateUrl: './masse-eau.component.html',
  styleUrls: ['./masse-eau.component.scss']
})
export class TableauMasseEauComponent extends ComponentViewRightMode implements OnChanges, OnDestroy, OnInit {

  /**
   * Boolean to disable button add dispositif if dossier is refused
   */
  disableIsRefused = false;

  data: any[] = [];

  /**
   * Data ligne masse d'eau provenant des ouvrages
   */
  dataMasseDeauOuvrage: any[] = [];

  /**
   * Message to display if there is an error
   */
  messageToDisplay: string;

  errorMessageEmptyField: string;

  /**
   * get service translate
   */
  labelTranslateClass = new LabelTranslate(this.translateService);

  /**
   * Input event if current operation
   */
  @Input() currentOperation: Operation;

  /**
   * Emit an event if there is an error to parent
   */
  @Output() masseEauHasErrorEvent: EventEmitter<boolean> = new EventEmitter();

  /**
   * Emit an event to parent in order to be notify
   */
  @Output() massesEauChangesEvent: EventEmitter<boolean> = new EventEmitter();

  /**
   * variable unsubscribe
   */
  private unsubscribe = new Subject<void>();

  /**
   * source for table ng2smart table
   */
  source: LocalDataSource = new LocalDataSource();

  /**
   * boolean to check if there is possibility to add new masse eau
   */
  canAddNewMasseEau = true;

  /**
   * boolean to check if the liste if masseEau is edited
   */
  isMasseEauListEdited = false;

  /**
   * Setting for table ng2smart table
   */
  settings: any = {
    actions: false,
    pager: {
      perPage: 30
    },
    noDataMessage: noMasseDeauMessage,
    hideSubHeader: true,
    columns: {
      code: {
        title: 'Code',
        type: 'custom',
        renderComponent: CodeMasseEauCellComponent,
        onComponentInitFunction: (instance) => {
          instance.editCodeMasseEauEvent.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
            if (value.code) {
              this.onEditCodeMasseEauEvent(value);
            } else {
              this.messageToDisplay = this.errorMessageEmptyField;
            }
          })
        },
        width: '22%',
        filter: false,
        editable: false,
        addable: false
      },
      nom: {
        title: 'Libellé',
        type: 'text',
        width: '32%',
        filter: false,
        addable: false
      },
      categorieLibelle: {
        title: 'Catégorie',
        type: 'text',
        width: '22%',
        filter: false,
        addable: false
      },
      commissionTerritorialeLibelle: {
        title: 'Commission Territoriale',
        type: 'text',
        width: '22%',
        filter: false,
        addable: false
      },
      myActions: {
        type: 'custom',
        renderComponent: ActionsTableauMasseEauComponent,
        onComponentInitFunction: (instance) => {
          instance.deleteMasseEauEvent.pipe(takeUntil(this.unsubscribe)).subscribe(application => {
            this.onDeleteMasseEauEvent(application);
          });
        },
        width: '2%',
        filter: false,
        addable: false
      }
    }
  };

  constructor(
    public dossierService: DossierService,
    private translateService: TranslateService
  ) {
    super(dossierService);
  }

  ngOnInit() {
    this.errorMessageEmptyField = this.labelTranslateClass.translateCodeInLabel('messages.veuillezSaisirNumeroMasseEau');
    // Subscription au sujet _localisationPertinente
    if (this.dossierService._localisationPertinente) {
      this.dossierService._localisationPertinente.subscribe(value => {
        this.source.refresh();
      });
    }
  }

  ngOnChanges() {
    // Recupération des masses d'eau provenant des ouvrages
    this.dataMasseDeauOuvrage = [];
    this.currentOperation.ouvrageNatureOperation.forEach((ouvrage => {
      this.dataMasseDeauOuvrage = concat(this.dataMasseDeauOuvrage, ouvrage.masseEaux);
    }));
    // Union des lignes de masse d'eau et celles des ouvrages
    this.data = unionBy(this.currentOperation.lignesMasseEau, this.dataMasseDeauOuvrage, 'code');
    this.messageToDisplay = '';
    this.loadSource();
  }

  /**
  * load data in table
  */
  loadSource() {
    this.source.load(this.data);
    this.manageAddButtonState();
  }

  /**
    * Sends back the updated form to the parent component to manage validation
    *  @param data it is the linesPrev in table Prev
   */
  notifyCheckParentComponent(valid?: boolean) {
    this.massesEauChangesEvent.emit(valid);
  }

  /**
   * suppress a selected line
   * @param ligne
   */
  onDeleteMasseEauEvent(ligne) {

    if (!this.isMasseEauListEdited) {

      this.isMasseEauListEdited = true;
      this.notifyCheckParentComponent(this.isMasseEauListEdited);
    }
    if (this.data.indexOf(ligne) === this.data.length - 1) {
      this.messageToDisplay = '';
    }
    this.masseEauHasErrorEvent.emit(false);
    this.data.splice(this.data.indexOf(ligne), 1);
    if (this.currentOperation.lignesMasseEau.indexOf(ligne) >= 0) {
      this.currentOperation.lignesMasseEau.splice(this.currentOperation.lignesMasseEau.indexOf(ligne), 1);
    }
    this.loadSource();
    if (verifierLocalisationPertinenteErreur(this.currentOperation)) {
      this.currentOperation.localisationPertinenteError = true;
    } else {
      this.currentOperation.localisationPertinenteError = false;
    }
  }

  /**
   *  check if masse eau exist already or not
   */
  checkUnsetMasseEau(): boolean {
    let result = false;
    this.data.slice(0, this.data.length - 1).forEach(masseEau => {
      if (masseEau.code === this.data[this.data.length - 1].code) {
        result = true;
      }
    });
    return result;
  }

  /**
   * on edit event recived from child component: CodeMasseEauCellComponent
   * @param row: data of the edited 'masse d eau'
   */
  onEditCodeMasseEauEvent(row: MasseEau) {
    if (!this.checkUnsetMasseEau() || this.data.length <= 1) {
      this.dossierService.getMasseEau(row.code).subscribe((data) => {
        this.messageToDisplay = '';
        row.nom = data.nom;
        row.code = data.code;
        row.commissionTerritorialeLibelle = data.commissionTerritorialeLibelle;
        row.categorieLibelle = data.categorieLibelle;
        row.hasError = false;
        const indiceElement = this.data.length - 1;
        this.data.splice(indiceElement, 1, row);
        // Difference entre data du tableau et des ouvrages
        const dataDifference = differenceBy(this.data, this.dataMasseDeauOuvrage, 'code');
        // Union pour recuperer les nouvelles données et les anciennes
        this.currentOperation.lignesMasseEau = unionBy(this.currentOperation.lignesMasseEau, dataDifference, 'code');
        this.canAddNewMasseEau = true;
        this.masseEauHasErrorEvent.emit(false);
        this.loadSource();
        if (verifierLocalisationPertinenteErreur(this.currentOperation)) {
          this.currentOperation.localisationPertinenteError = true;
        } else {
          this.currentOperation.localisationPertinenteError = false;
        }
      },
        (error: HttpErrorResponse) => {
          this.messageToDisplay = getErrorMessage(error);
          this.masseEauHasErrorEvent.emit(true);
          row.hasError = true;
          this.loadSource();
        }
      );
    } else {
      row.hasError = true;
      this.messageToDisplay = `La masse d'eau ${row.code} est déjà associée à cette nature d'opération`;
      this.masseEauHasErrorEvent.emit(true);
      this.loadSource();
    }
  }

  /**
   * Add new line (push + OR empty tab)
   */
  onAddLine() {
    this.messageToDisplay = this.errorMessageEmptyField;
    if (this.canAddNewMasseEau) {
      const newMasseEau: MasseEau = {
        code: '',
        nom: '',
        categorieCode: '',
        categorieLibelle: '',
        commissionTerritorialeCode: '',
        commissionTerritorialeLibelle: ''
      };
      this.data.push(newMasseEau);
      this.loadSource();
      this.canAddNewMasseEau = false;
      this.notifyCheckParentComponent(true);
      this.masseEauHasErrorEvent.emit(true);
    }
    this.currentOperation.localisationPertinenteError = false;
  }

  /**
   * manage state button add
   */
  manageAddButtonState(): void {
    this.canAddNewMasseEau = true;
    this.data.forEach((masseEau: MasseEau) => {
      if (masseEau && masseEau.nom === '') {
        this.canAddNewMasseEau = false;
      }
    })
    if (!this.viewRight === true) {
      this.disableIsRefused = true;
    } else {
      this.disableIsRefused = false;
    }
  }

  /**
    * Custom Size to noDataMessage when there is any masse d'eau
    */
  myCustomSize() {
    return NumberUtils.myCustomSize(this.data);
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe.next();
      this.unsubscribe.complete();
    }
    if (this.dossierService && this.dossierService._localisationPertinente) {
      // fin de subscription au Subject localisation service
      this.dossierService._localisationPertinente.next();
      this.dossierService._localisationPertinente.complete();
    }

  }
}
