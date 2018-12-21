import { Component, OnDestroy, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { EnumFormeAide } from 'app/pages/dossiers/dossier/enumeration/enumerations';
import { ComponentViewRightMode, DossierService } from 'app/pages/dossiers/dossiers.service';
import { noDataMessage } from 'app/shared/shared.retourApi';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';
import { LocalDataSource } from 'ng2-smart-table';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
/**
 * display all interventions rows of dossier nature
*/
@Component({
  selector: 'siga-tableau-recap-des-numeros',
  templateUrl: './tableau-recap-des-numeros.component.html',
  styleUrls: ['./tableau-recap-des-numeros.component.scss']
})
export class TableauRecapDesNumerosComponent extends ComponentViewRightMode implements OnDestroy, OnInit, OnChanges {
    /**
  * Define structure of table (column and style)
 */
@Input() delaiValiditeIn: number

dateAttribution: Date;
dateFinValidite: Date;
delaiValidite: number;

  /**
  * Source to be displayed in the table
  */
  source: LocalDataSource = new LocalDataSource();
  /**
  * Define structure of table (column and style)
 */
  settings = {
    actions: false,
    noDataMessage,
    hideSubHeader: true,
    columns: {
      numeroAide: {
        title: 'N° aide',
        type: 'txt',
        filter: false,
        width: '30%'
      },
      formeAide: {
        title: 'Forme d\'aide',
        type: 'txt',
        filter: false,
        width: '20%',
        valuePrepareFunction: (cell: any, row: any) => {
          let transformedValue = EnumFormeAide.A;
          if (row.formeAide === 'S') {
            transformedValue = EnumFormeAide.S;
          }
          return `${transformedValue}`;
        }
      },
      montantAide: {
        title: 'Montant d\'aide (€)',
        type: 'html',
        filter: false,
        width: '22%',
        valuePrepareFunction: (cell: any, row: any) => {
          let transformedValue = '0';
          if (row.montantAide) {
            transformedValue = this.formatMonetairePipe.transform(row.montantAide);
          }
          return `<div  class="util-right">${transformedValue}</div>`;
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
    public _dossierService: DossierService,
    public formatMonetairePipe: FormatMonetairePipe
  ) {
    super(_dossierService);
    // Loads the data the first time the DossierComponent is loaded (first navigation or F5)
    this.dossierReadySubscription = _dossierService.dossier$
      .subscribe(dossierReady => {
        if (_dossierService.dossier && _dossierService.dossier.dossierAdmin) {
          // The form loads too fast for IE, so we encapsulate the whole process in a setTimeout(0) to reset the call stack
          setTimeout(() => {
            this.source.load(_dossierService.dossier.dossierAdmin.numerosAide);
            this.updateDate();
          }, 0);
        }
      });

  }

  ngOnInit() {
    if (this._dossierService.dossier) {
      this.source.load(this._dossierService.dossier.dossierAdmin.numerosAide);
      this.updateDate();
    }
  }
  ngOnChanges(changes: SimpleChanges){
    if (changes.delaiValiditeIn ) {
      this.delaiValidite = parseInt(changes.delaiValiditeIn.currentValue);
      this.dateAttribution = this._dossierService.dossier.dossierAdmin.dateAttribution;
      console.log(this.dateAttribution);
      
      let dateFinValiditetmp = this.addMounthsToDate(this.dateAttribution, this.delaiValidite);
      this.dateFinValidite =dateFinValiditetmp;
    }

  }

  updateDate() {
    this.dateAttribution = this._dossierService.dossier.dossierAdmin.dateAttribution;
    this.delaiValidite = this._dossierService.dossier.dossierFinancier.delaiFinValidite;
    this.dateFinValidite =  this._dossierService.dossier.dossierAdmin.dateFinValidite;
  }
/**
 * 
 * @param date 
 * @param n 
 */
  addMounthsToDate(date: Date, n: number) {
    let outDatein = new Date(date);
    let outDate = new Date(date);
    outDate.setMonth(outDate.getMonth() + n);
    if (outDate.getDate() != outDatein.getDate()) {
      outDate.setDate(0);
    }
    return outDate;
  }

  ngOnDestroy() {
    this.dossierReadySubscription.unsubscribe();
  }

}
