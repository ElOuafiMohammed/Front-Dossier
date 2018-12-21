import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';

import { NatureOperation } from '../../../../dossier/dossier.interface';

@Component({
  selector: 'siga-app-input-libelle',
  templateUrl: './input-libelle.component.html',
  styleUrls: ['./input-libelle.component.scss']
})
export class InputLibelleComponent implements OnInit {


  public value: string;
  public messageToDisplay: string;
  @Input() rowData: NatureOperation;
  @Output() updateNatureEvent: EventEmitter<any> = new EventEmitter();
  formNatureOperation: FormGroup;
  index_tab_libelle = 0;

  constructor(
    private modalService: MatDialog,
    private _formBuilder: FormBuilder
  ) {

  }

  ngOnInit() {
    this.formNatureOperation = this._formBuilder.group({
      libelle: [this.value],
    });

  }

  onBlur() {

    const valeurChamp = this.formNatureOperation.get('libelle').value;
    if (valeurChamp !== this.rowData.libelle) {
      this.rowData.modif = true;
    }
    this.rowData.libelle = valeurChamp;

    this.updateNatureEvent.emit(this.rowData);
  }
}
