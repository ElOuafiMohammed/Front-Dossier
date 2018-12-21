import { Component, OnDestroy } from '@angular/core';
import { ComponentViewRightMode, DossierService } from 'app/pages/dossiers/dossiers.service';
import { noDataMessage } from 'app/shared/shared.retourApi';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';
import { LocalDataSource } from 'ng2-smart-table';
import { Subscription } from 'rxjs';

import { Settings } from './../../../recherche-dossier/recherche-dossier.interface';

/**
 * display all interventions rows of dossier nature
*/
@Component({
  selector: 'siga-montant-aide-total-table',
  templateUrl: './tableau-montant-aide-total.component.html',
  styleUrls: ['./tableau-montant-aide-total.component.scss']
})
export class TableauMontantAideTotalComponent extends ComponentViewRightMode implements OnDestroy {
  /**
  * Source to be displayed in the table
  */
  source: LocalDataSource = new LocalDataSource();
  /**
* Source to be displayed in the tableTotal
*/
  sourceTotals: LocalDataSource = new LocalDataSource();
  /**
   * Define structure of table (column and style)
  */
  settings: Settings = {
    actions: false,
    noDataMessage,
    hideSubHeader: true,
    columns: {
      ligne: {
        title: 'Ligne',
        type: 'txt',
        filter: false,
        width: '5%'
      },
      montantOperation: {
        title: 'Opération (€)',
        type: 'html',
        filter: false,
        width: '18%',
        valuePrepareFunction: (cell: any, row: any) => {
          let transformedValue = '0';
          if (row.montantOperation) {
            transformedValue = this.formatMonetairePipe.transform(row.montantOperation);
          }
          return `<div  class="util-right">${transformedValue}</div>`;
        }
      },
      montantEligible: {
        title: 'Eligible (€)',
        type: 'html',
        filter: false,
        width: '15%',
        valuePrepareFunction: (cell: any, row: any) => {
          let transformedValue = '0';
          if (row.montantEligible) {
            transformedValue = this.formatMonetairePipe.transform(row.montantEligible);
          }
          return `<div  class="util-right">${transformedValue}</div>`;
        }
      },
      montantRetenu: {
        title: 'Retenu (€)',
        type: 'html',
        filter: false,
        width: '15%',
        valuePrepareFunction: (cell: any, row: any) => {
          let transformedValue = '0';
          if (row.montantRetenu) {
            transformedValue = this.formatMonetairePipe.transform(row.montantRetenu);
          }
          return `<div  class="util-right">${transformedValue}</div>`;
        }
      },
      montantAvance: {
        title: 'Aide avance (€)',
        type: 'html',
        filter: false,
        width: '13%',
        valuePrepareFunction: (cell: any, row: any) => {
          let transformedValue = '0';
          if (row.montantAvance) {
            transformedValue = this.formatMonetairePipe.transform(row.montantAvance);
          }
          return `<div  class="util-right">${transformedValue}</div>`;
        }
      },
      montantSubvention: {
        title: 'Aide sub (€)',
        type: 'html',
        filter: false,
        width: '12%',
        valuePrepareFunction: (cell: any, row: any) => {
          let transformedValue = '0';
          if (row.montantSubvention) {
            transformedValue = this.formatMonetairePipe.transform(Math.round(row.montantSubvention));
          }
          return `<div  class="util-right">${transformedValue}</div>`;
        }
      },
      totalMontantAide: {
        title: 'Total Aide (€)',
        type: 'html',
        filter: false,
        width: '12%',
        valuePrepareFunction: (cell: any, row: any) => {
          let transformedValue = '0';
          if (row.totalMontantAide) {
            transformedValue = this.formatMonetairePipe.transform(Math.round(row.totalMontantAide));
          }
          return `<div  class="util-right">${transformedValue}</div>`;
        }
      },
      tauxAide: {
        title: '% Aide',
        type: 'html',
        filter: false,
        width: '8%',
        valuePrepareFunction: (cell: any, row: any) => {
          let transformedValue = 0;
          if (row.tauxAide) {
            transformedValue = this.limitDecimalTo2(row.tauxAide);
          }
          return `<div  class="util-right">${transformedValue}</div>`;
        }
      }

    }
  };

  /*
 * Define structure of table (one Row totals)
*/
  settingsTotals: any = {
    actions: false,
    hideSubHeader: true,
    columns: {
      ligne: {
        type: 'html',
        width: '5%',
        filter: false,
        addable: false,
        valuePrepareFunction: () => {
          return `<strong> TOTAL </strong>`;
        }
      },
      totalMontantOperation: {
        type: 'html',
        filter: false,
        width: '18%',
        valuePrepareFunction: (cell: any, row: any) => {
          let transformedValue = '0';
          if (row.totalMontantOperation) {
            transformedValue = this.formatMonetairePipe.transform(row.totalMontantOperation);
          }
          return `<div  class="util-right montant-op-recap-align-total">${transformedValue}</div>`;
        }
      },
      totalMontantEligible: {
        type: 'html',
        filter: false,
        width: '15%',
        valuePrepareFunction: (cell: any, row: any) => {
          let transformedValue = '0';
          if (row.totalMontantEligible) {
            transformedValue = this.formatMonetairePipe.transform(row.totalMontantEligible);
          }
          return `<div  class="util-right montant-eli-recap-align-total">${transformedValue}</div>`;
        }
      },
      totalMontantRetenu: {
        type: 'html',
        filter: false,
        width: '15%',
        valuePrepareFunction: (cell: any, row: any) => {
          let transformedValue = '0';
          if (row.totalMontantRetenu) {
            transformedValue = this.formatMonetairePipe.transform(row.totalMontantRetenu);
          }
          return `<div  class="util-right montant-ret-recap-align-total">${transformedValue}</div>`;
        }
      },
      totalMontantAvance: {
        type: 'html',
        filter: false,
        width: '13%',
        valuePrepareFunction: (cell: any, row: any) => {
          let transformedValue = '0';
          if (row.totalMontantAvance) {
            transformedValue = this.formatMonetairePipe.transform(row.totalMontantAvance);
          }
          return `<div  class="util-right montant-av-recap-align-total">${transformedValue}</div>`;
        }
      },
      totalMontantSubvention: {
        type: 'html',
        filter: false,
        width: '12%',
        valuePrepareFunction: (cell: any, row: any) => {
          let transformedValue = '0';
          if (row.totalMontantSubvention) {
            transformedValue = this.formatMonetairePipe.transform(Math.round(row.totalMontantSubvention));
          }
          return `<div  class="util-right montant-sub-recap-align-total">${transformedValue}</div>`;
        }
      },
      totalMontantAide: {
        type: 'html',
        filter: false,
        width: '12%',
        valuePrepareFunction: (cell: any, row: any) => {
          let transformedValue = '0';
          if (row.totalMontantAide) {
            transformedValue = this.formatMonetairePipe.transform(Math.round(row.totalMontantAide));
          }
          return `<div class="util-right">${transformedValue}</div>`;
        }
      },
      tauxMontantAide: {
        type: 'html',
        filter: false,
        width: '8%',
        valuePrepareFunction: (cell: any, row: any) => {
          let transformedValue = 0;
          if (row.tauxMontantAide) {
            transformedValue = this.limitDecimalTo2(row.tauxMontantAide);
          }
          return `<div class="util-right">${transformedValue}</div>`;
        }
      }
    }

  };

  dossierReadySubscription: Subscription = null;


  /**
   * Component dependencies
   * @param _dossierService used to manage dossiers
   */

  constructor(
    private _dossierService: DossierService,
    public formatMonetairePipe: FormatMonetairePipe
  ) {
    super(_dossierService);
    // Loads the data the first time the DossierComponent is loaded (first navigation or F5)
    this.dossierReadySubscription = _dossierService.dossier$
      .subscribe(dossierReady => {
        if (_dossierService.dossier) {
          // The form loads too fast for IE, so we encapsulate the whole process in a setTimeout(0) to reset the call stack
          setTimeout(() => {
            this.loadDataSource(_dossierService.dossier.dossierFinancier.lignesAide);
            this.loadDataTotal(_dossierService.dossier.dossierFinancier);
          }, 0);
        }
      });

  }

  /**
   *Load the data in the displayed table of rows interventions
   */
  loadDataSource(lignesAide): void {
    this.source.load(lignesAide);
  }

  /**
   *Load the data in the displayed table of total
  */
  loadDataTotal(intervention): void {
    this.sourceTotals.load([intervention]);
  }

  limitDecimalTo2(value: any): number {
    const factor = Math.pow(10, 2);
    return Math.round(value * factor) / factor;
  }

  ngOnDestroy() {
    this.dossierReadySubscription.unsubscribe();
  }

}
