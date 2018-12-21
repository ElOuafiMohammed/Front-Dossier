import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { NumberNumeroSDRegex } from 'app/pages/dossiers/dossiers.interface';

import { SessionDecision } from '../../../../dossier/dossier.interface';

@Component({
  selector: 'siga-app-input-numero-sd',
  templateUrl: './input-numero-sd.component.html',
  styleUrls: ['./input-numero-sd.component.scss']
})
export class InputNumeroSdComponent implements OnInit {


  public value: string;
  @Input() rowData: SessionDecision;
  @Output() updateSessionDecisionEvent: EventEmitter<any> = new EventEmitter();
  formSessionDecision: FormGroup;
  get numeroControl() { return this.formSessionDecision.get('numero'); }
  index_tab_numero = 0;
  message_erreur: Boolean = false;

  constructor(
    private modalService: MatDialog,
    private _formBuilder: FormBuilder,
    public translate: TranslateService
  ) {

  }

  ngOnInit() {
    this.formSessionDecision = this._formBuilder.group({
      numero: [this.value, [Validators.pattern(NumberNumeroSDRegex)]],
    });
  }
  onBlur() {
    const valeurChamp = this.formSessionDecision.get('numero').value;

    if (this.numeroControl.hasError('pattern') === true) {
      this.rowData.numeroError = true;
    } else {
      this.rowData.numeroError = false;
    }
    if (valeurChamp !== this.rowData.numero) {
      this.rowData.modif = true;
    }
    this.rowData.numero = valeurChamp;
    this.updateSessionDecisionEvent.emit(this.rowData);

  }


}
