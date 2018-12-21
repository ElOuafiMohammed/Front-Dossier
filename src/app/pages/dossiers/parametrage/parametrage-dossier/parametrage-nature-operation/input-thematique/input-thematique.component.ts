import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { Subject } from 'rxjs';

import { Thematique } from '../../../../create-dossier/create-dossier.interface';
import { NatureOperation } from '../../../../dossier/dossier.interface';

@Component({
  selector: 'siga-app-input-thematique',
  templateUrl: './input-thematique.component.html',
  styleUrls: ['./input-thematique.component.scss']
})
export class InputThematiqueComponent implements OnInit {


  public value: any;
  @Input() rowData: NatureOperation;
  @Output() updateNatureEvent: EventEmitter<any> = new EventEmitter();
  thematiques: Thematique[];
  formNatureOperation: FormGroup;
  private unsubscribe = new Subject<void>();

  selected: Thematique = null;

  index_tab_thematique = 0;

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  constructor(
    private modalService: MatDialog,
    private _dossierService: DossierService,
    private _formBuilder: FormBuilder
  ) {

  }

  ngOnInit() {

    this.thematiques = this._dossierService.getThematiques();
    // this.selected = this.thematiques.find(thematique => thematique.code === this.value);
  }

  change(value: Thematique) {
    this.value = value;
    this.rowData.codeThematique = value.code;
    this.selected = value;
    this.updateNatureEvent.emit(this.rowData);
  }
}
