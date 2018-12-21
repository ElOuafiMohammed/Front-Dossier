import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Caracteristique } from '../../../../../dossier.interface';

@Component({
  selector: 'siga-valeur',
  templateUrl: './valeur.component.html',
  styleUrls: ['./valeur.component.scss']
})
export class ValeurComponent implements OnInit {

  public value: string;
  rowData: Caracteristique;
  formValeurCaracteristique: FormGroup
  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.formValeurCaracteristique = this._formBuilder.group({
      valeurCaracteristique: [this.value],
    });
  }

}
