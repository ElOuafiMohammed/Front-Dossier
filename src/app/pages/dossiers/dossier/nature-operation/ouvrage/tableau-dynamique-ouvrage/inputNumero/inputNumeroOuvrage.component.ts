import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Ouvrage } from '../../tableau-dynamique-ouvrage/tableau-dynamique-ouvrage.interface';

@Component({
  selector: 'siga-input-numero-ouvrage',
  templateUrl: './inputNumeroOuvrage.component.html',
  styleUrls: ['./inputNumeroOuvrage.component.scss']
})
export class InputNumeroOuvrageComponent implements OnInit {


  /**
   * Input value
   */
  public value: string;

  /**
   * Date of row
   */
  @Input() rowData: Ouvrage;

  /**
   * Output event of update ouvrage
   */
  @Output() updateOuvrageEvent: EventEmitter<any> = new EventEmitter();

  /**
   * Form group
   */
  formOuvrage: FormGroup;

  constructor(
    private _formBuilder: FormBuilder
  ) {

  }

  /**
   * Init function
   */
  ngOnInit() {
    if (this.rowData) {
      this.value = this.rowData.codeAgence;
    }
    this.formOuvrage = this._formBuilder.group({
      codeAgence: [this.value],
    });

  }

  /**
   * Event function onBlur
   */
  onBlur() {
    const valeurChamp = this.formOuvrage.get('codeAgence').value;
    if (valeurChamp) {
      this.rowData.codeAgence = valeurChamp.toUpperCase();
      this.value = this.rowData.codeAgence
      this.updateOuvrageEvent.emit(this.rowData);
    }
  }
}
