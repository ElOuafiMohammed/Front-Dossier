import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import MethodeGenerique from 'app/shared/methodes-generiques';
import { noPrevisionnelLineRattacheMessage, PrevisionnelLinesTotalMessage } from 'app/shared/shared.retourApi';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';
import { LocalDataSource } from 'ng2-smart-table';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { LignePrev, PreDossier } from '../../../dossiers.interface';
import { ComponentViewRightMode, DossierService } from '../../../dossiers.service';
import { ActionsCellComponent } from './actionsCell/actionsCell.component';
import { InputCellAideComponent } from './inputCell-aide/inputCellAide.component';
import { InputCellComponent } from './inputCell/inputCell.component';
import { SelectInputLibelleComponent } from './select-input-libelle/select-input-libelle.component';
import { Libelle } from './tableau-dynam-prev-interface';
import NumberUtils from 'app/shared/utils/number-utils';

@Component({
  selector: 'siga-app-tableau-dynam-prev',
  templateUrl: './tableau-dynam-prev.component.html',
  styleUrls: ['./tableau-dynam-prev.component.scss']
})
export class TableauDynamPrevComponent extends ComponentViewRightMode implements OnChanges, OnDestroy {


  private unsubscribe = new Subject<void>();
  /**
  * Source to be displayed in the tablePrev
  */
  source: LocalDataSource = new LocalDataSource();
  /**
  * Source to be displayed in the tableTotal
  */
  sourceTotals: LocalDataSource = new LocalDataSource();
  /**
  * List of preview Lines
  */
  data: LignePrev[] = [];

  public value = 0;
  /**
 * preDossier attached to dossier
 */
  @Input() preDossier: PreDossier;
  @Input() row: any;

  @Input() thematiqueLinesPrevisionnel: Libelle[] = null;
  @Input() viewRight: boolean = null;

  /**
 * event to go back to the parent component the configuration lines in the table Prev
 */
  @Output() onLinePrevAttaChange: EventEmitter<LignePrev[]> = new EventEmitter();
  // @Output() editApplicationEvent: EventEmitter<any> = new EventEmitter();
  control: FormControl = new FormControl(this.value);
  /**
  * manage active desactive bouttonn addLine
  */
  canAdd = true;
  /*
  *  total calculation
  */
  somme = { totalMontantTravauxPrev: 0, totalMontantAidePrev: 0 };
  sommeFormat = { totalMontantTravauxPrev: '', totalMontantAidePrev: '' };
  /*
   * Define structure of table Prev
  */
  settings: any = { actions: false };
  /*
   * Define structure of table (one Row totals)
  */
  settingsTotals: any = { actions: false };
  /*
  * Liste  will be used to select elemethis.linesToSelectnt
  */
  lines: Libelle[] = [];
  /*
  * liste of instance from inputselect component
  **/
  instance: SelectInputLibelleComponent[] = [];
  /*
  * List of libelle of lines Prev already attached to dossier
  */
  indexSelect = 30;
  selectedLines: Libelle[] = [];
  indexPrev = 31;
  indexMontAide = 32;

  /**
   * Component dependencies
  */
  constructor(
    private formatMonetairePipe: FormatMonetairePipe,
    public dossierService: DossierService,
  ) {
    super(dossierService);

  }

  ngOnChanges(changes: SimpleChanges) {
    // TODO : rewrite better later on
    if (changes['thematiqueLinesPrevisionnel'] && (changes['thematiqueLinesPrevisionnel'].currentValue as Array<any>).length > 0) {
      let lines: Libelle[] = [...this.thematiqueLinesPrevisionnel];
      this.preDossier.lignesPrevisionnel
        .forEach(lignePrev => {
          this.selectedLines.push(lignePrev.ligne);
          lines = lines.filter(line => line.id !== lignePrev.ligne.id);
        });
      if (this.lines.length === 0) {
        this.canAdd = false;
      }

      this.addDisabledAttribute(this.selectedLines, this.lines, true);
      this.addDisabledAttribute(lines, this.lines, false);

      this.initPrevTable();
      this.initTotalTable();
      this.data = MethodeGenerique.deepClone(this.preDossier.lignesPrevisionnel);

      if (this.isEmptyData()) {
        this.canAdd = false;
        this.onAddLine();
      } else {
        this.loadSource();
      }
    }

    if (!changes['thematiqueLinesPrevisionnel']) {
      let lines: Libelle[] = [...this.thematiqueLinesPrevisionnel];

      this.preDossier.lignesPrevisionnel
        .forEach(lignePrev => {
          this.selectedLines.push(lignePrev.ligne);
          lines = lines.filter(line => line.id !== lignePrev.ligne.id);
        });

      this.data = MethodeGenerique.deepClone(this.preDossier.lignesPrevisionnel);

      if (this.isEmptyData()) {
        this.onAddLine();
      } else {
        this.loadSource();
      }
    }
    this.returnUnusedLibelle();
  }

  /**
  * delete selected line
  * @param  lignetoDelete line to be deleted
  **/
  onDeleteApplicationEvent(lignetoDelete: LignePrev): void {
    this.canAdd = true;
    this.source.remove(lignetoDelete);
    this.lines.forEach(line => {
      if (line.id === this.data[this.data.indexOf(lignetoDelete)].ligne.id) {
        line.disable = false;
      }
    });
    this.data.splice(this.data.indexOf(lignetoDelete), 1);

    this.loadSource();

    this.notifyParentComponent(this.data);
    if (this.data.length === 0) {
      this.onAddLine();
    }
  }

  onEditEvent(row: LignePrev) {
    let isNewlyCreatedDossier = null;
    let originalLinePrev: LignePrev = null;
    if (this.preDossier && this.preDossier.lignesPrevisionnel) {
      isNewlyCreatedDossier = this.preDossier.lignesPrevisionnel.length === 0;
      originalLinePrev = this.preDossier.lignesPrevisionnel.find(ligne => ligne.id === row.id);
    }
    if (isNewlyCreatedDossier) {
      if (row.montantAidePrev > 0 || row.montantTravauxPrev > 0) {
        this.initSommeTable();
        this.loadDataTotal();
        this.notifyParentComponent(this.data);
      } else {
        this.notifyParentComponent(null);
      }
    } else {
      if (this.lineChanged(originalLinePrev, row)) {
        this.initSommeTable();
        this.loadDataTotal();
        this.notifyParentComponent(this.data);
      } else {
        this.notifyParentComponent(null);
      }
    }
  }

  /**
   * Compares two lines prev to see if they are the same or not
   */
  lineChanged(line1: LignePrev, line2: LignePrev): boolean {
    return JSON.stringify(line1) !== JSON.stringify(line2);
  }

  onAddLine() {
    const freeLibelles = this.returnUnusedLibelle();
    let libelle: Libelle = {
      id: null,
      numero: '',
      codeThematique: '',
      libelle: ''
    };

    if (freeLibelles.length !== 0) {
      if (freeLibelles.length === 1) {
        freeLibelles[0].disable = true;
        libelle = freeLibelles[0];
      }

      const newLigne = {
        id: null,
        ligne: libelle,
        montantTravauxPrev: 0,
        montantAidePrev: 0
      };

      if (this.isEmptyData()) {
        this.initFirstLine(newLigne);
      }

      this.source.append(newLigne);
      this.loadSource();
    }

    this.canAdd = false;
  }

  /**
  * Init source and data with first coutTravaux
  * @param newMontantPrev
  */
  initFirstLine(newMontantPrev) {
    this.data.push(newMontantPrev);
    this.source = new LocalDataSource();
    this.sourceTotals = new LocalDataSource();
  }

  returnUnusedLibelle(): Libelle[] {
    const freeLines: Libelle[] = [];
    this.lines.forEach(line => {
      if (!line.disable) {
        freeLines.push(line);
      }
    });
    if (freeLines.length === 0) { this.canAdd = false };
    return freeLines;
  }

  onEditSelectEvent(libelle: Libelle[]) {
    this.lines.forEach(line => {
      if (libelle[0].id == null) {
        this.canAdd = true;
      }
      if ((libelle[0].id != null) && line.id === libelle[0].id) {
        line.disable = false;
      }
      if (line.id === libelle[1].id) {
        line.disable = true;
      }
    });
    this.loadSource();
    this.notifyParentComponent(this.data);
    this.instance.forEach(instance => instance.getFreeLines());

  }

  /**
   * Sends back the updated form to the parent component to manage validation
   *  @param data it is the linesPrev in table Prev
  */
  notifyParentComponent(data: LignePrev[]) {
    this.onLinePrevAttaChange.emit(data);
  }

  initPrevTable() {
    this.settings = {
      actions: false,
      hideSubHeader: true,
      noDataMessage: noPrevisionnelLineRattacheMessage,
      columns: {
        ligne: {
          title: 'Ligne',
          type: 'custom',
          renderComponent: SelectInputLibelleComponent,
          onComponentInitFunction: (instance) => {
            this.indexSelect += 3;
            instance.indexSelect = this.indexSelect;
            this.instance.push(instance);
            instance.lines = this.lines;
            instance.editApplicationEventSelect.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
              this.onEditSelectEvent(value);
            })
          },
          width: '18%',
          filter: false,
          addable: false,
        },

        montantTravauxPrev: {
          title: 'Opération (€)',
          type: 'custom',
          renderComponent: InputCellComponent,
          onComponentInitFunction: (instance) => {
            this.indexPrev += 3;
            instance.indexPrev = this.indexPrev;
            instance.editApplicationEvent.pipe(takeUntil(this.unsubscribe))
              .subscribe(value => {
                this.onEditEvent(value);
              });
          },
          width: '40%',
          filter: false,
          addable: false,
        },
        montantAidePrev: {
          title: 'Aide (€)',
          type: 'custom',
          renderComponent: InputCellAideComponent,
          onComponentInitFunction: (instance) => {
            this.indexMontAide += 3;
            instance.indexMontAide = this.indexMontAide;
            instance.editApplicationEvent.subscribe(value => {
              this.onEditEvent(value);
            });
          },
          width: '40%',
          filter: false,
          addable: false,
        },
        myActions: {
          type: 'custom',
          renderComponent: ActionsCellComponent,
          onComponentInitFunction: (instance) => {
            instance.deleteApplicationEvent.pipe(takeUntil(this.unsubscribe)).subscribe(application => {
              this.onDeleteApplicationEvent(application);
            });
          },
          width: '2%',
          filter: false,
          addable: false,
        },
      },
    };
  }

  initTotalTable() {
    this.settingsTotals = {
      actions: { position: 'right', edit: false, add: false, delete: false },
      hideSubHeader: false, hideSubfooter: true,
      noDataMessage: PrevisionnelLinesTotalMessage,
      columns: {
        ligne: {
          type: 'html',
          width: '18%',
          filter: false,
          addable: false,
          valuePrepareFunction: () => {
            return `<strong> TOTAL </strong>`;
          }
        },
        totalMontantTravauxPrev: {
          type: 'html',
          filter: false,
          width: '40%',
          valuePrepareFunction: (cell: any, row: any) => {
            let transformedValue = '0';
            if (row && row.totalMontantTravauxPrev) {
              transformedValue = this.formatMonetairePipe.transform(row.totalMontantTravauxPrev);
            }
            return `<div  class="total-operation--prev-align">${transformedValue}</div>`;
          }
        },
        totalMontantAidePrev: {
          type: 'html',
          filter: false,
          width: '40%',
          valuePrepareFunction: (cell: any, row: any) => {
            let transformedValue = '0';
            if (row && row.totalMontantAidePrev) {
              transformedValue = this.formatMonetairePipe.transform(row.totalMontantAidePrev);
            }
            return `<div class="total-aide-prev-align">${transformedValue}</div>`;
          }
        },
        action: {
          type: 'html',
          width: '2%',
          filter: false,
          addable: false
        },
      }
    };
  }

  addDisabledAttribute(linesToTrait: Libelle[], lines: Libelle[], value: boolean) {
    linesToTrait.forEach(line => {
      lines.push({
        id: line.id,
        codeThematique: line.codeThematique,
        libelle: line.libelle,
        numero: line.numero,
        disable: value
      });
    });
  }

  onMontantAideBlur(montantAidePrev: string) {
    if (!this.control.errors) {
      this.row.montantAidePrev = NumberUtils.toNumber(montantAidePrev);
      this.onLinePrevAttaChange.emit(this.row);
    } else {
      this.onLinePrevAttaChange.emit(null);
    }
  }

  /**
  *  conversion en entier (suppression des blancs)
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
    this.initSommeTable();
    this.loadDataTotal();
    this.manageAddButtonState();
  }

  /**
   * Loads formatted data
  */
  loadDataTotal(): void {
    this.sourceTotals.load([this.somme]);
  }

  /*
   * init total
   */
  initSommeTable() {
    this.somme.totalMontantTravauxPrev = 0;
    this.somme.totalMontantAidePrev = 0;

    this.data.forEach((mntPrev) => {
      if (mntPrev.montantTravauxPrev) {
        this.somme.totalMontantTravauxPrev += mntPrev.montantTravauxPrev;
      }
      if (mntPrev.montantAidePrev) {
        this.somme.totalMontantAidePrev += mntPrev.montantAidePrev;
      }
    });
  }

  manageAddButtonState(): void {
    this.canAdd = false;
    if (!this.viewRight === true) {

      this.canAdd = true;
      // this.data.forEach((cout) => {
      //   if (cout.libelleCout === '') {
      //     this.canAdd = false;
      //   }
      // })
    }
  }


  isEmptyData(): boolean {
    return (!this.data || this.data.length === 0);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
