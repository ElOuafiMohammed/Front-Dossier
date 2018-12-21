import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { NumberNumeroOpRegex } from 'app/pages/dossiers/dossiers.interface';

import { NatureOperation } from '../../../../dossier/dossier.interface';

@Component({
  selector: 'siga-app-input-numero',
  templateUrl: './input-numero.component.html',
  styleUrls: ['./input-numero.component.scss']
})
export class InputNatNumeroComponent implements OnInit {


  public value: string;
  @Input() rowData: NatureOperation;
  @Output() updateNatureEvent: EventEmitter<any> = new EventEmitter();
  formNatureOperation: FormGroup;
  get numeroControl() { return this.formNatureOperation.get('numero'); }
  index_tab_numero = 0;
  message_erreur: Boolean = false;

  constructor(
    private modalService: MatDialog,
    private _formBuilder: FormBuilder,
    public translate: TranslateService
  ) {

  }

  ngOnInit() {
    this.formNatureOperation = this._formBuilder.group({
      numero: [this.value, [Validators.pattern(NumberNumeroOpRegex)]],
    });
  }
  onBlur() {
    const valeurChamp = this.formNatureOperation.get('numero').value;

    if (this.numeroControl.hasError('pattern') === true) {
      this.rowData.numeroError = true;
    } else {
      this.rowData.numeroError = false;
    }
    if (valeurChamp !== this.rowData.numero) {
      this.rowData.modif = true;
    }
    this.rowData.numero = valeurChamp;
    this.updateNatureEvent.emit(this.rowData);

  }

}
