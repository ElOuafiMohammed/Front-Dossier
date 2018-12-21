import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { Subject } from 'rxjs';

import { Ligne } from '../../../../create-dossier/create-dossier.interface';
import { NatureOperation } from '../../../../dossier/dossier.interface';

@Component({
  selector: 'siga-app-input-ligne',
  templateUrl: './input-ligne.component.html',
  styleUrls: ['./input-ligne.component.scss']
})
export class InputLigneComponent implements OnInit {

  public value: any;
  @Input() rowData: NatureOperation;
  @Output() updateNatureEvent: EventEmitter<any> = new EventEmitter();
  lignes: Ligne[];
  private unsubscribe = new Subject<void>();

  selected: Ligne = null;

  index_tab_ligne = 0;

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  constructor(
    private modalService: MatDialog,
    private _formBuilder: FormBuilder,
    private _dossierService: DossierService
  ) {

  }

  ngOnInit() {

    this.lignes = this._dossierService.getLignes();
  }

  change(value: Ligne) {
    this.value = value;
    this.rowData.ligne = value.numero;
    this.selected = value;
    this.updateNatureEvent.emit(this.rowData);
  }
}

