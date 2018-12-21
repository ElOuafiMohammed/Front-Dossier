import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ViewCell } from 'ng2-smart-table';

import { DispositifPartenariatOperation } from '../../../dossier.interface';


@Component({
  selector: 'siga-pourcentsubvention',
  templateUrl: './pourcentSubventionDP.component.html',
  styleUrls: ['./pourcentSubventionDP.component.scss'],
})

export class PourcentSubventionDPComponent implements OnInit, ViewCell {
  /**
   * valeur du pourcentageSubvention courant du formulaire
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
   * Initialisation du composant PourcentSubvention
   */
  ngOnInit() {
    this.control = new FormControl(this.value);
    this.control.disable();
  }

}

