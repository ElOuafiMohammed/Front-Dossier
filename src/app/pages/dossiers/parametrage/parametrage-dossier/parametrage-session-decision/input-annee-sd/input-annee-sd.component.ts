import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NumberAnneeSDRegex } from 'app/pages/dossiers/dossiers.interface';

import { SessionDecision } from '../../../../dossier/dossier.interface';

@Component({
  selector: 'siga-app-input-annee-sd',
  templateUrl: './input-annee-sd.component.html',
  styleUrls: ['./input-annee-sd.component.scss']
})
export class InputAnneeSdComponent implements OnInit {


  public value: string;
  @Input() rowData: SessionDecision;
  @Output() updateSessionDecisionEvent: EventEmitter<any> = new EventEmitter();
  formSessionDecision: FormGroup;
  get anneeControl() { return this.formSessionDecision.get('annee'); }
  index_tab_annee = 0;
  message_erreur = false;

  constructor(
    private _formBuilder: FormBuilder,
    public translate: TranslateService
  ) {

  }

  ngOnInit() {
    this.formSessionDecision = this._formBuilder.group({
      annee: [this.value, [Validators.pattern(NumberAnneeSDRegex)]]
    });
  }
  onBlur() {
    // this.onlyNumber(this.formSessionDecision.get('annee'), event);
    const valeurChamp = this.formSessionDecision.get('annee').value;

    if (valeurChamp !== this.rowData.annee) {
      this.rowData.modif = true;
    }
    this.rowData.annee = valeurChamp;
    if (this.anneeControl.hasError('pattern')) {
      this.rowData.anneeError = true;
    } else {
      this.rowData.anneeError = false;
    }
    this.updateSessionDecisionEvent.emit(this.rowData);

  }


}
