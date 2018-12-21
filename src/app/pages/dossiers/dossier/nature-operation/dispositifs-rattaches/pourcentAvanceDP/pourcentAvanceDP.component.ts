import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ViewCell } from 'ng2-smart-table';

import { DispositifPartenariatOperation } from '../../../dossier.interface';


@Component({
  selector: 'siga-pourcentavance',
  templateUrl: './pourcentAvanceDP.component.html',
  styleUrls: ['./pourcentAvanceDP.component.scss'],
})

export class PourcentAvanceDPComponent implements OnInit, ViewCell {
  /**
   * valeur du pourcentageAvance courant du formulaire
   */
  public value: string;

  /**
   * Table de dispositif
   */
  @Input() rowData: DispositifPartenariatOperation;

  /**
   * Contrôleur du champ de saisie
   */

  control: FormControl;

  constructor() { }

  /**
   * Initialisation du composant PourcentAvance
   */
  ngOnInit() {
    this.control = new FormControl(this.value);
    this.control.disable();
  }
}

