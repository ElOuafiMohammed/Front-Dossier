import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Caracteristique } from '../../../../../dossier.interface';

@Component({
  selector: 'siga-app-caracteristique',
  templateUrl: './caracteristique.component.html',
  styleUrls: ['./caracteristique.component.scss']
})
export class CaracteristiqueComponent implements OnInit {

  public value: string;
  rowData: Caracteristique;
  formCaracteristique: FormGroup;
  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.formCaracteristique = this._formBuilder.group({
      caracteristique: [this.value],
    });
  }

}
