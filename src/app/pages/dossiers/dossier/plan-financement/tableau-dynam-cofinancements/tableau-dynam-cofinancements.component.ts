import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import MethodeGenerique from 'app/shared/methodes-generiques';
import { noCofinanceurRattacheMessage } from 'app/shared/shared.retourApi';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';
import { LocalDataSource } from 'ng2-smart-table';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ComponentViewRightMode, DossierService } from '../../../dossiers.service';
import { PlanFinancementDossier } from './../../../dossiers.interface';
import { ActionsCellCofinComponent } from './actionsCellCofin/actionsCellCofin.component';
import { InputCellCofinAideComponent } from './inputCellCofin-aide/inputCellCofinAide.component';
import { InputCellTauxComponent } from './inputTaux/inputCellTaux.component';
import { PrecisionComponent } from './precision/precision.component';
import { SelectInputCofinanceurComponent } from './select-input-cofinanceur/select-input-cofinanceur.component';
import { CoFinanceur, Financeur } from './tableau-dynam-cofinancements-interface';

@Component({
  selector: 'siga-app-tableau-dynam-cofin',
  templateUrl: './tableau-dynam-cofin.component.html',
  styleUrls: ['./tableau-dynam-cofin.component.scss']
})
export class TableauDynamCofinancementsComponent extends ComponentViewRightMode implements OnChanges, OnDestroy {
  /**
  * Source to be displayed in the tableCofinancement
  */
  private unsubscribe = new Subject<void>();
  source: LocalDataSource = new LocalDataSource();
  data: CoFinanceur[] = [];
  noDataMessage = `Pas de Cofinanceur associé`;

  public value = 0;
  /**
  * preDossier attached to dossier
  */
  planFinancementDossier: PlanFinancementDossier;

  @Input() cofinanceurlines: Financeur[] = null;
  @Input() viewRight: boolean = null;
  subjectTauxAide = new Subject<CoFinanceur>();
  subjectMontantAide = new Subject<CoFinanceur>();
  subjectPrecision = new Subject<CoFinanceur>();

  /**
  * event to go back to the parent component the configuration lines in the table cofin
  */
  @Output() onLineCofinanceurAttaChange: EventEmitter<any> = new EventEmitter();
  // @Output() editApplicationEvent: EventEmitter<any> = new EventEmitter();
  control: FormControl = new FormControl(this.value);
  /**
  * manage active desactive bouttonn addLine
  */
  canAdd = true;
  i = 0;
  /*
  /* // * total calculation
  /*
  * Define structure of table cofin
  */
  settings: any = { actions: false };
  /*
  * Define structure of table (one Row totals)
  */
  /* // settingsTotals: any = { actions: false }; */
  /*
  * Liste will be used to select elemethis.linesToSelectnt
  */
  lines: Financeur[] = [];
  linesCofin: Financeur[] = [];
  /*
  * liste of instance from inputselect component
  **/
  instance: SelectInputCofinanceurComponent[] = [];
  indexSelect = 100;
  selectedLines: Financeur[] = [];
  indexPrecision = 101;
  indexTauxCofin = 102
  indexMontAideCofin = 103;

  dossierReadySubscription: Subscription = null;
  tauxError: Boolean = false;

  /**
   * Component dependencies
   * @param _dossierService used to manage dossiers
   */
  constructor(
    private _dossierService: DossierService,
    public _formatMonetairePipe: FormatMonetairePipe
  ) {
    super(_dossierService);
    // Loads the data the first time the DossierComponent is loaded (first navigation or F5)
    this.dossierReadySubscription = _dossierService.dossier$
      .subscribe(dossierReady => {
        if (_dossierService.dossier) {
          // The form loads too fast for IE, so we encapsulate the whole process in a setTimeout(0) to reset the call stack
          setTimeout(() => {

            this.planFinancementDossier = { coFinanceurs: MethodeGenerique.deepClone(_dossierService.dossier.planFinancementDossier.coFinanceurs) };
            const lines: Financeur[] = MethodeGenerique.deepClone(this.cofinanceurlines);
            this.addDisabledAttribute(this.selectedLines, this.lines, true);
            this.addDisabledAttribute(lines, this.lines, false);
            this.initCofinTable();
            this.data = MethodeGenerique.deepClone(this.planFinancementDossier.coFinanceurs);
            if (this.isEmptyData()) {
              this.canAdd = false;
              if (!this.viewRight === true) {
                this.canAdd = true;
              }

            } else {
              this.loadSource();
            }
          }, 0);
        }
      });
  }
  ngOnChanges(changes: SimpleChanges) {
    // TODO : rewrite better later on
    this.canAdd = true;
    if (changes['cofinanceurlines'].currentValue) {
      if (changes['cofinanceurlines'] && (changes['cofinanceurlines'].currentValue as Array<any>).length > 0) {
        this.linesCofin = [...this.cofinanceurlines];
        let lines: Financeur[] = [...this.cofinanceurlines];
        if (this.planFinancementDossier) {
          this.planFinancementDossier.coFinanceurs
            .forEach(ligneCofin => {
              this.selectedLines.push(ligneCofin.financeur);
              lines = this.cofinanceurlines.filter(line => line.id !== ligneCofin.financeur.id);
            });
          if (!this.lines) {
            this.canAdd = false;
          }

          this.addDisabledAttribute(this.selectedLines, this.lines, true);
          this.addDisabledAttribute(lines, this.lines, false);
          this.initCofinTable();
          this.data = MethodeGenerique.deepClone(this.planFinancementDossier.coFinanceurs);
        }
        if (!this.isEmptyData()) {
          this.loadSource();
        }
      }
    }

    if (!changes['cofinanceurlines']) {
      let lines: Financeur[] = [...this.cofinanceurlines];

      this.planFinancementDossier.coFinanceurs
        .forEach(ligneCofin => {
          this.selectedLines.push(ligneCofin.financeur);
          this.lines = lines;
        });
      this.data = MethodeGenerique.deepClone(this.planFinancementDossier.coFinanceurs);
      if (this.isEmptyData()) {
        this.onAddLine();
      } else {
        this.loadSource();
      }
    }
    this.returnUnusedCofinanceur();
  }

  /**
  * delete selected line
  * @param lignetoDelete line to be deleted
  **/
  onDeleteApplicationEvent(lignetoDelete: CoFinanceur): void {
    this.canAdd = true;
    this.source.remove(lignetoDelete);
    this.lines.forEach(line => {
      if (line.id === this.data[this.data.indexOf(lignetoDelete)].financeur.id) {
        line.disable = false
      }
    });
    this.data.splice(this.data.indexOf(lignetoDelete), 1);
    this.tauxError = this.checkTauxError(this.data);
    this.loadSource();

    this.notifyParentComponent(this.data, this.tauxError);
  }

  onEditEvent(row: CoFinanceur) {
    if (row) {
      const isNewlyCreatedDossier = this.planFinancementDossier.coFinanceurs.length === 0;
      const originalLineCofin: CoFinanceur = this.planFinancementDossier.coFinanceurs.find(ligne => ligne.id === row.id);
      if (isNewlyCreatedDossier) {
        if (row.montantAide > 0 || row.tauxAide > 0) {
          this.notifyParentComponent(this.data, this.tauxError);
        } else {
          this.notifyParentComponent(null, this.tauxError);
        }
      } else {
        if (this.lineChanged(originalLineCofin, row)) {
          this.notifyParentComponent(this.data, this.tauxError);
        } else {
          this.notifyParentComponent(null, this.tauxError);
        }
      }
    }
  }

  /**
  * Compares two lines cofin to see if they are the same or not
  */
  lineChanged(line1: CoFinanceur, line2: CoFinanceur): boolean {
    return JSON.stringify(line1) !== JSON.stringify(line2);
  }

  onAddLine() {
    this.i++;
    const freeFinanceurs = this.returnUnusedCofinanceur();
    let financeur: Financeur = {
      id: null,
      code: '',
      financeurPublic: null,
      libelle: '',
      disable: null,
    };

    if (freeFinanceurs.length !== 0) {
      if (freeFinanceurs.length === 1) {
        freeFinanceurs[0].disable = true;
        financeur = freeFinanceurs[0];
      }

      const newCofinLigne = {
        id: null,
        financeur: financeur,
        precision: '',
        tauxAide: 0,
        montantAide: 0,
        idFront: this.i
      };

      if (this.isEmptyData()) {
        this.initFirstLine(newCofinLigne);
      }
      this.source.append(newCofinLigne);
      this.loadSource();
    }
    this.canAdd = false;

  }

  /**
  * Init source and data with first newCofinLigne
  * @param newCofinLine
  */
  initFirstLine(newCofinLine) {
    this.data.push(newCofinLine);
    this.source = new LocalDataSource();
  }

  returnUnusedCofinanceur(): Financeur[] {
    const freeLines: Financeur[] = MethodeGenerique.deepClone(this.cofinanceurlines);
    return freeLines;
  }

  onEditSelectEvent(libelle: Financeur[]) {
    this.lines.forEach(line => {
      if (libelle[0].id == null) {
        this.canAdd = true;
      }
    });

    this.loadSource();
    this.notifyParentComponent(this.data, this.tauxError);
  }

  /**
  * Sends back the updated form to the parent component to manage validation
  * @param data it is the linescofin in table cofin
  */
  notifyParentComponent(data: CoFinanceur[], tauxError) {
    this.onLineCofinanceurAttaChange.emit({ data, tauxError });
  }

  initCofinTable() {
    this.settings = {
      actions: false,
      noDataMessage: noCofinanceurRattacheMessage,
      hideSubHeader: true,
      columns: {
        financeur: {
          title: 'Co-financeur',
          type: 'custom',
          renderComponent: SelectInputCofinanceurComponent,
          onComponentInitFunction: (instance) => {
            this.indexSelect += 3;
            instance.indexSelect = this.indexSelect;
            instance.lines = this.linesCofin;
            instance.editApplicationEventSelect.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
              this.onEditSelectEvent(value);
            })
          },
          width: '25%',
          filter: false,
          addable: false,
        },
        precision: {
          title: 'Précision',
          type: 'custom',
          renderComponent: PrecisionComponent,
          onComponentInitFunction: (instance) => {
            this.indexPrecision += 3;
            instance.indexPrecision = this.indexPrecision;
            this.subjectPrecision
              .subscribe((row: CoFinanceur) => {
                if (row && row.id && row.id === instance.rowData.id || (!row.id && (row.idFront === instance.rowData.idFront))) {
                  instance.onKeyTouched = false;
                  let precisionCofin = '';

                  precisionCofin = (row.precision);

                  row.precision = precisionCofin;
                  instance.control.setValue(precisionCofin);
                }

              });
            instance.editApplicationEvent.pipe(takeUntil(this.unsubscribe))
              .subscribe(value => {
                this.onEditEvent(value);
                // update montant if there is no error on tauxAide
                if (value != null) {
                  this.subjectPrecision.next(value);
                }
              });
          },
          width: '30%',
          filter: false,
          addable: false
        },
        financeurPublic: {
          title: 'Type',
          type: 'txt',
          filter: false,
          width: '10%',
          valuePrepareFunction: (cell: any, row: any) => {
            if (row.financeur.financeurPublic === true) {
              return 'Public';
            }
            if (row.financeur.financeurPublic === false) {
              return 'Privé';
            }
          }
        },

        tauxAide: {
          title: 'Taux (%)',
          type: 'custom',
          renderComponent: InputCellTauxComponent,
          onComponentInitFunction: (instance) => {
            instance.tauxError = this.tauxError;
            this.indexTauxCofin += 3;
            instance.indexTauxCofin = this.indexTauxCofin;
            this.subjectMontantAide
              //   .takeWhile(() => !this.value)
              .subscribe((row: CoFinanceur) => {

                if (row && row.id && row.id === instance.rowData.id || (!row.id && (row.idFront === instance.rowData.idFront))) {
                  instance.onKeyTouched = false;
                  let tauxAideCalculated = 0;
                  if (this._dossierService.dossier.dossierFinancier.totalMontantOperation !== 0) {
                    tauxAideCalculated = (Math.ceil(row.montantAide) * 100 / this._dossierService.dossier.dossierFinancier.totalMontantOperation);
                  }
                  if (tauxAideCalculated > 100) {
                    this.tauxError = true;
                    instance.tauxError = this.tauxError;

                  } else {
                    this.tauxError = false;
                    instance.tauxError = this.tauxError;

                  }
                  row.tauxAide = tauxAideCalculated;
                  instance.control.setValue(this.limitDecimalTo2(tauxAideCalculated));
                }

              });
            // instance
            instance.editApplicationEvent
              .subscribe(value => {
                if (value.tauxAide > 100) {
                  this.tauxError = true;
                  instance.tauxError = this.tauxError;

                } else {
                  this.tauxError = false;
                  instance.tauxError = this.tauxError;

                }
                // update montant if there is no error on tauxAide
                if (value != null) {
                  this.subjectTauxAide.next(value);
                }
                this.onEditEvent(value);
              });
          },
          width: '17%',
          filter: false,
          addable: false,
        },
        montantAide: {
          title: 'Aide (€)',
          type: 'custom',
          renderComponent: InputCellCofinAideComponent,
          onComponentInitFunction: (instance) => {
            this.indexMontAideCofin += 3;
            instance.indexMontAideCofin = this.indexMontAideCofin;

            this.subjectTauxAide
              .subscribe((row: CoFinanceur) => {
                if (row && row.id && row.id === instance.rowData.id || (!row.id && (row.idFront === instance.rowData.idFront))) {
                  instance.onKeyTouched = false;
                  row.montantAide = Math.ceil((this._dossierService.dossier.dossierFinancier.totalMontantOperation * row.tauxAide) / 100);
                  const montantAide = this._formatMonetairePipe.transform(row.montantAide);
                  instance.control.setValue(montantAide);
                }

              });
            instance.editApplicationEvent.subscribe(value => {
              this.onEditEvent(value);

              // update tauxAide if there is no error on montant
              if (value != null) {
                this.subjectMontantAide.next(value);
              }
            });
          },
          width: '28%',
          filter: false,
          addable: false,
        },
        myActions: {
          type: 'custom',
          renderComponent: ActionsCellCofinComponent,
          onComponentInitFunction: (instance) => {
            instance.deleteApplicationEvent.subscribe(application => {
              this.onDeleteApplicationEvent(application);
            });
          },
          width: '3%',
          filter: false,
          addable: false,
        }
      }
      ,
      pager: {
        display: false
      }
    };
  }

  addDisabledAttribute(linesToTrait: Financeur[], lines: Financeur[], value: boolean) {
    linesToTrait.forEach(line => {
      lines.push({
        id: line.id,
        code: line.code,
        financeurPublic: line.financeurPublic,
        libelle: line.libelle,
        disable: value
      });
    });
  }

  onEditPrecisionEvent(row: CoFinanceur) {
    if (row) {
      const isNewlyCreatedDossier = this.planFinancementDossier.coFinanceurs.length === 0;
      const originalLineCofin: CoFinanceur = this.planFinancementDossier.coFinanceurs.find(ligne => ligne.id === row.id);
      if (isNewlyCreatedDossier) {
        this.notifyParentComponent(this.data, false);
      } else {
        if (this.lineChanged(originalLineCofin, row)) {
          this.notifyParentComponent(this.data, false);
        } else {
          this.notifyParentComponent(null, false);
        }
      }
    }
  }

  /**
  * conversion en entier (suppression des blancs)
  * @param value
  */
  toNumber(value: string) {
    return value ? parseInt(value.replace(/ /g, ''), 0) : 0;
  }

  /*********************** */

  /**
  * Init source and data with coutTravaux
  */
  loadSource() {
    this.source.load(this.data);
    this.manageAddButtonState();
  }

  manageAddButtonState(): void {
    this.canAdd = false;
    if (!this.viewRight === true) {
      this.canAdd = true;
    }
  }

  isEmptyData(): boolean {
    return (!this.data || this.data.length === 0);
  }

  limitDecimalTo2(value: any): number {
    const factor = Math.pow(10, 2);
    return Math.round(value * factor) / factor;
  }

  checkTauxError(financeurs: CoFinanceur[]): boolean {
    let error = false;
    financeurs.forEach(line => {
      if (line.tauxAide > 100) {
        error = true;
        return error;
      }
    });
    return error;
  }

  ngOnDestroy() {
    if (this.dossierReadySubscription) {
      this.dossierReadySubscription.unsubscribe();
    }
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
