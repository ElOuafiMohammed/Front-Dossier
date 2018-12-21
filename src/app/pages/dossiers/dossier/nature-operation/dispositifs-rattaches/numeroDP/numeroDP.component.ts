import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Dispositif } from 'app/pages/dossiers/dossiers.interface';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { ViewCell } from 'ng2-smart-table';

import { DispositifPartenariatOperation } from '../../../dossier.interface';

@Component({
  selector: 'siga-numerodp',
  templateUrl: './numeroDP.component.html',
  styleUrls: ['./numeroDP.component.scss'],
})

export class NumeroDPComponent implements OnInit, ViewCell {

  /**
   * current numeroOrdre value of form
   */
  public value: string;

  /**
   * Table of dispositif
   */
  @Input() rowData: DispositifPartenariatOperation;

  /**
   *Event of current dispositif updated
   */
  @Output() updateDispositifEvent: EventEmitter<any> = new EventEmitter();

  /**
 *Event of current error on numero of dispositif
 */
  @Output() errorNumeroEvent: EventEmitter<any> = new EventEmitter();

  @Input() listDispositifs: Dispositif[] = [];

  /**
   * Control of input of numero DP
   */

  control: FormControl;

  numeroOrdreFormatted: string;

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  constructor() { }

  /**
   * Init component numeroDP
   */
  ngOnInit() {

    this.control = new FormControl(this.value);
    if (this.rowData.dispositifPartenariat.complementIntitule || !this.rowData.dispositifPartenariat.typeDispositif.id) {
      this.control.disable();
    }
    this.numeroOrdreFormatted = this.formattedNumeroCode(this.rowData.dispositifPartenariat.numeroOrdre)
  }

  /**
   * Function to detect changes of value of control active Dispositif list
   * @param dispositif: control of numero DP
   */
  change(dispositif) {
    if (dispositif) {
      this.rowData.dispositifPartenariat.numeroOrdre = dispositif.numeroOrdre;
      this.rowData.dispositifPartenariat.complementIntitule = dispositif.complementIntitule;
      this.rowData.numeroOrdre = dispositif.numeroOrdre;
      this.rowData.complementIntitule = dispositif.complementIntitule;

      this.updateDispositifEvent.emit(this.rowData);
      this.errorNumeroEvent.emit(false);
    } else {
      this.errorNumeroEvent.emit(true);
    }
  }

  /**
   * Function to open other window
   * @param event: event click
   */
  goOtherWindow(event) {
    if (event) {
      window.open(this.rowData.urlFrontDispositifPartenariat, '_blank', 'toolbar=yes,scrollbars=yes,resizable=yes,top=80,left=80,width=1200');
    }
  }

  /**
   * Function to formatter a number to string with zeros
   * @param numero: number to formatter of string
   */
  formattedNumeroCode(numero: number): string | undefined {
    if (numero) {
      const lengthCurrentNumero = numero.toString().length;
      let index;
      let value = '';
      for (index = 0; index < (4 - lengthCurrentNumero); index++) {
        value += '0';
      }
      return value + numero.toString();
    }
  }

}
