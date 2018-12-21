import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DispositifPartenariatOperation } from 'app/pages/dossiers/dossier/dossier.interface';
import { ViewCell } from 'ng2-smart-table';

@Component({
  selector: 'siga-complementdp',
  templateUrl: './complementDP.component.html',
  styleUrls: ['./complementDP.component.scss'],
})

export class ComplementDPComponent implements OnInit, ViewCell {

  /**
   * Current complement value of form
   */
  public value: any;

  /**
   * Table of dispositif
   */
  @Input() rowData: DispositifPartenariatOperation;


  /**
  * Control of input of complement
  */

  control: FormControl;

  constructor() { }


  ngOnInit() {
    this.control = new FormControl(this.value);
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
}
