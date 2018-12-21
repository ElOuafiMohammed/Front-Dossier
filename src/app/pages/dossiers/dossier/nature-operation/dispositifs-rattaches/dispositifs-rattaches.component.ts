import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from 'app/app.service';
import { DispositifPartenariatOperation, Operation, TypeDispositif } from 'app/pages/dossiers/dossier/dossier.interface';
import {
  ComplementDPComponent,
} from 'app/pages/dossiers/dossier/nature-operation/dispositifs-rattaches/complementDP/complementDP.component';
import {
  UrlFrontDPComponent,
} from 'app/pages/dossiers/dossier/nature-operation/dispositifs-rattaches/urlFrontDP/urlFrontDP.component';
import { Dispositif } from 'app/pages/dossiers/dossiers.interface';
import { ComponentViewRightMode, DossierService } from 'app/pages/dossiers/dossiers.service';
import { LabelTranslate } from 'app/shared/label-translate.class';
import { noDispositifRattacheMessage, snackbarConfigError } from 'app/shared/shared.retourApi';
import NumberUtils from 'app/shared/utils/number-utils';
import { LocalDataSource } from 'ng2-smart-table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ActionsCellDPComponent } from './actionsCellDP/actionsCellDP.component';
import { MontantAvanceDPComponent } from './montantAvanceDP/montantAvanceDP.component';
import { MontantSubDPComponent } from './montantSubDP/montantSubDP.component';
import { NumeroDPComponent } from './numeroDP/numeroDP.component';
import { PourcentAvanceDPComponent } from './pourcentAvanceDP/pourcentAvanceDP.component';
import { PourcentSubventionDPComponent } from './pourcentSubventionDP/pourcentSubventionDP.component';
import { TypeDPComponent } from './typeDP/typeDP.component';




@Component({
  selector: 'siga-dispositifs-rattaches',
  templateUrl: './dispositifs-rattaches.component.html',
  styleUrls: ['./dispositifs-rattaches.component.scss'],
})

export class DispositifsRattachesComponent extends ComponentViewRightMode implements OnInit, OnDestroy, OnChanges {

  indexTabAvance = 4000;
  indexTabSubvention = 4001;
  private unsubscribe = new Subject<void>();
  subject = new Subject<DispositifPartenariatOperation>();
  subjectOperationError = new Subject<DispositifPartenariatOperation>();
  /**
  * boolean to display or not error message of Montantsubvention
  */
  displayErrorMontantSubvention = false;

  /**
  * boolean to display or not error message of MontantAvance
  */
  displayErrorMontantAvance = false;

  /**
  * Source to be displayed in the tableDispositif
  */
  source: LocalDataSource = new LocalDataSource();

  /**
  * List of dispositif
  */
  data: DispositifPartenariatOperation[] = [];

  /**
   * Current operation
   */
  @Input() currentOperation: Operation;

  /**
   * Event to manage error to notify parent
   */
  @Output() isFormDispositifValid: EventEmitter<any> = new EventEmitter();


  /**
  * Event to manage change and  notify parent
  */
  @Output() isFormDispositifChange: EventEmitter<any> = new EventEmitter();

  /**
   * Manage Error
   */
  enableMessageError: boolean;

  /**
  * manage active desactive bouttonn addLine
  */
  canAdd = true;

  /**
   * boolean to manage error in new line of dispositif
   */
  isError = false;

  /**
   * Boolean to disable button add dispositif if dossier is refused
   */
  disableIsRefused = false;

  /**
   * message of error
   */
  message: string;
  /*
  * Liste  will be used to select elemethis.linesToSelectnt
  */
  typesDispositif: TypeDispositif[] = [];

  /**
   * variable of success message
   */
  snackbarConfigSuccess: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'right',
    verticalPosition: 'bottom',
    panelClass: 'snack-bar-success'
  };

  /**
   * variable of error message
   */
  snackbarConfigError: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'right',
    verticalPosition: 'bottom',
    panelClass: 'snack-bar-error'
  };

  @Output() listeDPActifsChange: EventEmitter<Dispositif[]> = new EventEmitter();

  /*
   * Define structure of table Dispositif
  */
  settings = {
    actions: false,
    hideSubHeader: true,
    noDataMessage: noDispositifRattacheMessage,
    columns: {
      urlFrontDispositifPartenariat: {
        title: '',
        type: 'custom',
        width: '2%',
        renderComponent: UrlFrontDPComponent,
      },
      typeDispositifPartenariat: {
        title: 'Type',
        type: 'custom',
        renderComponent: TypeDPComponent,
        onComponentInitFunction: (instance) => {
          instance.typesDispositif = this.typesDispositif;
          instance.updateDispositifEvent.subscribe(value => {
            value.numeroOrdre = null;

            this.rechercherDPActifs(value.typeDispositifPartenariat);

            this.currentOperation.messageErrorDispositif = this.labelTranslateClass
              .translateCodeWithParamsToLabel('messages.messageErrorDispositifRattache');

            this.manageError(value.dispositifPartenariat);
            this.loadDataSource();
          });
        },
        width: '10%',
        filter: false,
        addable: false
      },
      numeroOrdre: {
        title: 'Numéro',
        type: 'custom',
        renderComponent: NumeroDPComponent,
        onComponentInitFunction: (instance) => {

          this.listeDPActifsChange.subscribe(valueData => {
            instance.listDispositifs = valueData;
          });

          instance.updateDispositifEvent
            .subscribe(value => {
              if (value.dispositifPartenariat.typeDispositif.id && value.dispositifPartenariat.numeroOrdre) {
                this.updateDispositif(value.dispositifPartenariat);
              }
              this.manageError(value.dispositifPartenariat);
            });

          instance.errorNumeroEvent.subscribe(value => {
            if (value) {
              this.currentOperation.messageErrorDispositif = this.labelTranslateClass
                .translateCodeWithParamsToLabel('messages.messageErrorTypeDispositif');
              this.loadDataSource();
            }
          });
        },
        width: '5%',
        filter: false,
        addable: false
      },
      complementIntitule: {
        title: 'Complément intitulé',
        type: 'custom',
        renderComponent: ComplementDPComponent,
        width: '24%',
        filter: false,
        addable: false
      },
      montantAvance: {
        title: 'Avance Affectée (€)',
        type: 'custom',
        renderComponent: MontantAvanceDPComponent,
        onComponentInitFunction: (instance) => {
          this.indexTabAvance += 4;
          instance.indexTabAvance = this.indexTabAvance;
          instance.updateDispositifEvent
            .subscribe(value => {
              this.updateAvance(value);
              value.erreurAvance = this.displayErrorMontantAvance;
              this.subject.next(value);
            });
        },
        width: '13%',
        filter: false,
        addable: false
      },
      pourcentageAvance: {
        title: 'Avance Affectée (%)',
        type: 'custom',
        renderComponent: PourcentAvanceDPComponent,
        onComponentInitFunction: (instance) => {
          this.subject.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
            if (instance.rowData === value) {
              instance.control.setValue(value.pourcentageAvance);
              this.source.refresh();
            }
          });
        },
        width: '13%',
        filter: false,
        addable: false
      },
      montantSubvention: {
        title: 'Subvention Affectée (€)',
        type: 'custom',
        renderComponent: MontantSubDPComponent,
        onComponentInitFunction: (instance) => {
          this.indexTabSubvention += 4;
          instance.indexTabSubvention = this.indexTabSubvention;
          instance.updateDispositifEvent
            .subscribe(value => {
              this.updateSubvention(value);
              value.erreurSubvention = this.displayErrorMontantSubvention;
              this.subject.next(value);
            });
        },
        width: '15%',
        filter: false,
        addable: false
      },
      pourcentageSubvention: {
        title: 'Subvention Affectée (%)',
        type: 'custom',
        renderComponent: PourcentSubventionDPComponent,
        onComponentInitFunction: (instance) => {
          this.subject.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
            if (instance.rowData === value) {
              instance.control.setValue(value.pourcentageSubvention);
              this.source.refresh();
            }
          });
        },

        width: '15%',
        filter: false,
        addable: false
      },
      myActions: {
        type: 'custom',
        renderComponent: ActionsCellDPComponent,
        onComponentInitFunction: (instance) => {
          instance.deleteDispositifEvent.subscribe(dispositif => {
            this.onDeleteDispositifEvent(dispositif);
          });
        },
        width: '5%',
        filter: false,
        addable: false
      },
    },
  };


  labelTranslateClass = new LabelTranslate(this.translate);

  /**
   *  type of dispositif partenariat that will not be taken into account for the cumulation of the amounts
   *
   */
  TYPE_DP_NON_CUMUL = 'CPER';
  /**
    * Component dependencies
     * @param dossierService used to manage dossiers
    */
  constructor(
    private _snackbar: MatSnackBar,
    private dossierService: DossierService,
    public translate: TranslateService,
    private _appService: AppService,
    public router: Router

  ) {
    super(dossierService)
  }


  /**
   * For change of current operation
   */
  ngOnChanges() {
    this.loadCurrentOperation(this.currentOperation);
  }

  /**
   * Init of component
   */
  ngOnInit() {
    this.loadCurrentOperation(this.currentOperation);
    this.dossierService.getTypeDispositif()
      .subscribe((types) => {
        this.typesDispositif = types;
      });
    this.loadDataSource();
  }


  updateSubvention(value) {

    if (NumberUtils.toNumber(value.montantSubvention) > Math.round(this.currentOperation.montantSubvention)) {
      value.pourcentageSubvention = this.calculPourcentageMontantSub(0);
      this.currentOperation.messageErrorDispositif = this.labelTranslateClass
        .translateCodeWithParamsToLabel('messages.messageErrorDispositifMontantSubvention');
      this.displayErrorMontantSubvention = true;
      this.manageCanAdd(false);

    } else {
      if (value.dispositifPartenariat.typeDispositif.id && value.dispositifPartenariat.numeroOrdre) {
        value.pourcentageSubvention = this.calculPourcentageMontantSub(NumberUtils.toNumber(value.montantSubvention));
        this.displayErrorMontantSubvention = false;
        if (this.displayErrorMontantAvance) {
          this.currentOperation.messageErrorDispositif = this.labelTranslateClass
            .translateCodeWithParamsToLabel('messages.messageErrorDispositifMontantAvance');
        }
        if (!this.displayErrorMontantAvance && !this.displayErrorMontantSubvention) {
          // Verification of cumulation  of montantSubvention
          if (this.isCumulMontantSubventionValide()) {
            // if cumulation of montantAvance is valid
            if (this.isCumulMontantAvanceValide()) {
              this.manageCanAdd(true);
            }
          }
          this.currentOperation.messageErrorDispositif = '';
        }
      }
    }
    this.manageError(value.dispositifPartenariat);

  }


  updateAvance(value) {
    // if montantAvance entered is > than the total of montantAvance
    if (NumberUtils.toNumber(value.montantAvance) > Math.round(this.currentOperation.montantAvance)) {
      value.pourcentageAvance = this.calculPourcentageMontantAvance(0);
      this.currentOperation.messageErrorDispositif = this.labelTranslateClass
        .translateCodeWithParamsToLabel('messages.messageErrorDispositifMontantAvance');
      this.manageCanAdd(false);
      this.displayErrorMontantAvance = true;
    } else {
      if (value.dispositifPartenariat.typeDispositif.id && value.dispositifPartenariat.numeroOrdre) {
        value.pourcentageAvance = this.calculPourcentageMontantAvance(NumberUtils.toNumber(value.montantAvance));
        this.displayErrorMontantAvance = false;
        if (this.displayErrorMontantSubvention) {
          this.currentOperation.messageErrorDispositif = this.labelTranslateClass
            .translateCodeWithParamsToLabel('messages.messageErrorDispositifMontantSubvention');
        }
        if (!this.displayErrorMontantAvance && !this.displayErrorMontantSubvention) {
          // Verification of cumulation of  montantSubvention
          if (this.isCumulMontantAvanceValide()) {
            // cumulation of montantSubvention is valid
            if (this.isCumulMontantSubventionValide()) {
              this.manageCanAdd(true);
            }
          }

          this.currentOperation.messageErrorDispositif = '';
        }
      }
    }
    this.manageError(value.dispositifPartenariat);
  }

  /**
   * active or deactive the button
   */
  manageAddButtonState(): void {

    if (!this.viewRight === true) {
      this.disableIsRefused = false;
    } else {
      this.disableIsRefused = true;
    }
  }

  /**
   * Load information for the current operation
   * @param currentOperation: paramter of current operation
   *
   */
  loadCurrentOperation(currentOperation) {
    if (currentOperation) {
      if (!currentOperation.dispositifRattacheError) {
        this.currentOperation.messageErrorDispositif = '';
        currentOperation.dispositifRattacheError = false;
      }

      this.currentOperation.dispositifPartenariatOperation.forEach(rowda => {
        rowda.urlFrontDispositifPartenariat = this.dossierService.getUrlDispositifFront(rowda.idDispositifPartenariat);
        if (rowda.montantAvance !== null && rowda.montantSubvention !== null) {

          rowda.pourcentageAvance = this.calculPourcentageMontantAvance(rowda.montantAvance);
          rowda.pourcentageSubvention = this.calculPourcentageMontantSub(rowda.montantSubvention);
        }

        if (rowda.montantAvance > Math.round(this.currentOperation.montantAvance)) {
          this.currentOperation.messageErrorDispositif = this.labelTranslateClass
            .translateCodeWithParamsToLabel('messages.messageErrorDispositifMontantAvance');

          currentOperation.dispositifRattacheError = true;
          this.displayErrorMontantAvance = true;
          this.manageCanAdd(false);
          this.loadDataSource();
        }

        if (rowda.montantSubvention > Math.round(this.currentOperation.montantSubvention)) {
          this.currentOperation.messageErrorDispositif = this.labelTranslateClass
            .translateCodeWithParamsToLabel('messages.messageErrorDispositifMontantSubvention');
          currentOperation.dispositifRattacheError = true;
          this.displayErrorMontantSubvention = true;
          this.manageCanAdd(false);
          this.loadDataSource();
        }

      });

      this.data = currentOperation.dispositifPartenariatOperation;
      this.loadDataSource();
    }
  }

  /**
   * load data of dispositif and sort types of dispositif
   */
  loadDataSource() {
    this.source.load(this.data);
    this.manageAddButtonState();
  }

  /**
  * delete selected dispositif
  * @param  dispositifToDelete line to be deleted
  **/
  onDeleteDispositifEvent(dispositifToDelete: DispositifPartenariatOperation): void {
    this.isError = false;
    this.source.remove(dispositifToDelete);
    this.data.splice(this.data.indexOf(dispositifToDelete), 1);
    this.data.forEach(rowda => {
      if (rowda.dispositifPartenariat.complementIntitule === ''
        || rowda.erreurAvance
        || rowda.erreurSubvention
        || !this.isCumulMontantAvanceValide()
        || !this.isCumulMontantSubventionValide()) {
        this.isError = true;
      }
    });

    if (this.isError) {
      this.isFormDispositifChange.emit(false);
      this.manageCanAdd(false);
    } else {
      this.isFormDispositifChange.emit(true);
      this.currentOperation.messageErrorDispositif = '';
      this.manageCanAdd(true);
      this.loadDataSource();
    }
    // If there is an error on the accumulation of the montantAvance
    if (this.currentOperation.isErreurCumulMontantAvance) {
      this.isCumulMontantAvanceValide();
    }

    // If there is an error on the accumulation of the montantSubvention
    if (this.currentOperation.isErreurCumulMontantSubvention) {
      this.isCumulMontantSubventionValide();
    }
  }

  /**
   * Add new line of dispositif
   */
  onAddDispositif() {
    if (!this.currentOperation.dispositifRattacheError) {
      const typeDispositif: TypeDispositif = {
        id: null,
        libelle: '',
        code: '',
        codeParam: '',
        libelleParam: '',
        texte: ''
      };
      const newDispositif: Dispositif = {
        id: null,
        typeDispositif,
        numeroOrdre: null,
        complementIntitule: '',
        urlFrontDispositifPartenariat: '',
        isSansObjet: false
      };

      const newDispositifPartenariat: DispositifPartenariatOperation = {
        id: null,
        numeroOrdre: null,
        idDispositifPartenariat: null,
        typeDispositifPartenariat: typeDispositif,
        complementIntitule: '',
        dispositifPartenariat: newDispositif,
        montantAvance: null,
        pourcentageAvance: null,
        montantSubvention: null,
        pourcentageSubvention: null,
        urlFrontDispositifPartenariat: ''

      };

      this.data.push(newDispositifPartenariat);
      this.currentOperation.messageErrorDispositif = this.labelTranslateClass
        .translateCodeWithParamsToLabel('messages.messageErrorDispositifRattache');
      this.manageCanAdd(false);
      this.loadDataSource();
    }
  }

  /**
   * Search active dispositif by type
   * @param typeDispositif dispositif type
   */
  rechercherDPActifs(typeDispositif: TypeDispositif) {

    const listeASupprimer: Dispositif[] = [];

    this.dossierService.getDispositifsNonCloturesByType(typeDispositif.id).
      subscribe(listDispositifs => {
        listDispositifs.forEach(dispositif => {
          this.data.forEach(disp => {
            // delete the list of dispositif already attached and manage empty list
            if (dispositif.typeDispositif.code === disp.typeDispositifPartenariat.code && dispositif.numeroOrdre === disp.numeroOrdre) {
              listeASupprimer.push(dispositif);
            }
          });
        })

        listeASupprimer.forEach(dispositifASupprimer => {
          listDispositifs.splice(listDispositifs.indexOf(dispositifASupprimer), 1);
        })

        this.listeDPActifsChange.emit(listDispositifs);

        if (listDispositifs.length === 0) {
          this.currentOperation.messageErrorDispositif = 'Aucun dispositif trouvé pour ce type';
        } else {
          this.currentOperation.messageErrorDispositif = 'Veuillez saisir le type et le numéro du dispositif.';
        }
      })



  }

  /**
   * Check the dispositif is already added in table
   */
  checkUnsetDispositif(row: Dispositif): boolean {
    let result = false;
    const length = this.data.length;
    if (length === 1) { return false; }
    let occurrence = 0;
    this.data.forEach(rowda => {
      if (+rowda.dispositifPartenariat.numeroOrdre && (+rowda.dispositifPartenariat.numeroOrdre === +row.numeroOrdre) &&
        (rowda.dispositifPartenariat.typeDispositif.code === row.typeDispositif.code)) {
        occurrence++;
      }
    });
    if (occurrence === 2) {
      result = true;
    }
    return result;
  }

  /**
   * Update dispositif if typeDispositif and numero are defined
   * @param row: line of dispositif.
   */
  updateDispositif(row: Dispositif) {
    if (!this.checkUnsetDispositif(row)) {
      this.data.forEach(rowda => {
        if (row.numeroOrdre && rowda.dispositifPartenariat.numeroOrdre === row.numeroOrdre &&
          rowda.dispositifPartenariat.typeDispositif.id === row.typeDispositif.id) {
          this.dossierService.getDispositif(row.typeDispositif.id, (row.numeroOrdre).toString())
            .subscribe(dispositifResult => {
              rowda.dispositifPartenariat.id = dispositifResult.id;
              rowda.dispositifPartenariat.complementIntitule = dispositifResult.complementIntitule;
              rowda.complementIntitule = dispositifResult.complementIntitule;
              if (dispositifResult.isSansObjet) {
                rowda.montantAvance = null;
                rowda.montantSubvention = null;
                rowda.pourcentageAvance = null;
                rowda.pourcentageSubvention = null;
              } else {
                rowda.montantAvance = rowda.montantAvance ? rowda.montantAvance : Math.round(this.currentOperation.montantAvance);
                rowda.montantSubvention = rowda.montantSubvention ? rowda.montantSubvention : Math.round(this.currentOperation.montantSubvention);
                rowda.pourcentageAvance = this.calculPourcentageMontantAvance(rowda.montantAvance);
                rowda.pourcentageSubvention = this.calculPourcentageMontantSub(rowda.montantSubvention);
              }
              rowda.urlFrontDispositifPartenariat = this.dossierService.getUrlDispositifFront(dispositifResult.id);
              rowda.dispositifPartenariat.urlFrontDispositifPartenariat = `${this._appService.environment.FRONT_DISPOSITIF}/dispositif/${dispositifResult.id}`;
              this.isFormDispositifChange.emit(true);
              // if cumulation of montantAvance and  montantSubvention  are valid
              const resultCumulAvance = this.isCumulMontantAvanceValide();
              const resultCumulSubvention = this.isCumulMontantSubventionValide();
              if (resultCumulAvance && resultCumulSubvention) {
                this.manageCanAdd(true);
              }

              this.currentOperation.messageErrorDispositif = '';
              this.loadDataSource();
            },
              (error) => {
                this.currentOperation.messageErrorDispositif = `Dispositif inconnu !`;
                this.loadDataSource();
              });
        }
      });
    } else {
      this.enableMessageError = true;
      this.currentOperation.messageErrorDispositif = `Le dispositif  ${row.typeDispositif.code} ${row.numeroOrdre} est déjà associé`;
      this.loadDataSource();
    }
  }

  /**
   * Manage error in new dispositif
   * @param currentDispositif: current dispositif.
   */
  manageError(currentDispositif: Dispositif) {
    if (currentDispositif.complementIntitule === '') {
      this.manageCanAdd(false);
    }
  }

  /**
   * managing the addition of new line of dispositif
   * @param canAddLine: value to add or not a new line of dispositif
   */
  manageCanAdd(canAddLine: boolean) {
    if (canAddLine) {
      this.isFormDispositifValid.emit(true);
      this.enableMessageError = false;
      this.canAdd = true;
    } else {
      this.isFormDispositifValid.emit(false);
      this.enableMessageError = true;
      this.canAdd = false;
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  /**
  * Calcul pourcentage of montant Avance
  * @param currentMontantAvance: current montant avance
  */
  calculPourcentageMontantAvance(currentMontantAvance: number) {
    let tempoMontant;
    if (currentMontantAvance === 0 || this.currentOperation.montantAvance === 0) {
      return '0%';
    } else {
      tempoMontant = Math.round((currentMontantAvance / Math.round(this.currentOperation.montantAvance)) * 100);
      return (tempoMontant).toString() + '%';
    }
  }

  /**
   * Calcul pourcentage of montant subvention
   * @param currentMontantSub: current montant subvention
   */
  calculPourcentageMontantSub(currentMontantSub: number) {
    let tempoMontant;
    if (currentMontantSub === 0 || this.currentOperation.montantSubvention === 0) {
      return '0%';
    } else {
      tempoMontant = Math.round((currentMontantSub / Math.round(this.currentOperation.montantSubvention)) * 100);
      return (tempoMontant).toString() + '%';
    }
  }

  /**
   * Calcul cumulation of montantAvance of operation dispositif partenariat
   */
  getMontantAvanceCumul(): number {
    let montantCumul = 0;
    this.currentOperation.dispositifPartenariatOperation.forEach(dp => {
      // If type of DP is different from CPER
      if (dp.typeDispositifPartenariat.code !== this.TYPE_DP_NON_CUMUL) {
        montantCumul += dp.montantAvance
      }
    });
    return montantCumul;

  }

  /**
   * Verify validity of cumulation  montantAvance of DP
   *
   * @returns boolean
   */
  isCumulMontantAvanceValide(): boolean {
    // If there is more than one dispositif partenariat operation
    if (this.currentOperation.dispositifPartenariatOperation &&
      this.currentOperation.dispositifPartenariatOperation.length > 1) {
      // If  cumulation  of montantAvance of DP is  > to montantAvance of operation
      if (this.getMontantAvanceCumul() > Math.round(this.currentOperation.montantAvance)) {
        this.manageCanAdd(false);
        this.currentOperation.isErreurCumulMontantAvance = true;
        return false;
      }
    }
    this.currentOperation.isErreurCumulMontantAvance = false;
    return true;
  }

  /**
   * Verify validity of cumulation  montantSubvention of DP
   *
   * @returns boolean
   */
  isCumulMontantSubventionValide(): boolean {
    // If there is more than one dispositif partenariat operation
    if (this.currentOperation.dispositifPartenariatOperation &&
      this.currentOperation.dispositifPartenariatOperation.length > 1) {
      // If cumulation  of montantSubvention of DP is  > to montantSubvention of operation
      if (this.getMontantSubventionCumul() > Math.round(this.currentOperation.montantSubvention)) {
        this.manageCanAdd(false);
        this.currentOperation.isErreurCumulMontantSubvention = true;
        return false;
      }
    }
    this.currentOperation.isErreurCumulMontantSubvention = false;
    return true;
  }

  /**
 * Calcul cumulation of montantSubvention of operation dispositif partenariat
 */
  getMontantSubventionCumul(): number {
    let montantCumul = 0;
    this.currentOperation.dispositifPartenariatOperation.forEach(dp => {
      // If type of DP ist different from CPER
      if (dp.typeDispositifPartenariat.code !== this.TYPE_DP_NON_CUMUL) {
        montantCumul += dp.montantSubvention;
      }
    });
    return montantCumul;
  }

}
