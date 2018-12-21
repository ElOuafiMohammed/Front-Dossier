import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { Subject } from 'rxjs';

import { ProcedureDecision, SessionDecision } from '../../../../dossier/dossier.interface';

@Component({
  selector: 'siga-app-input-type',
  templateUrl: './input-type.component.html',
  styleUrls: ['./input-type.component.scss']
})
export class InputTypeComponent implements OnInit {


  public value: any;
  @Input() rowData: SessionDecision;
  @Output() updateSessionDecisionEvent: EventEmitter<any> = new EventEmitter();
  sessionsDecision: SessionDecision[];
  procedures: ProcedureDecision[] = null;
  formSessionDecision: FormGroup;
  private unsubscribe = new Subject<void>();

  selected: ProcedureDecision = null;

  index_tab_type = 0;

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

    this.sessionsDecision = this._dossierService.getSessionsDecision();
    this.procedures = this._dossierService.getProcedureDecisions();

  }

  change(value: ProcedureDecision) {
    this.value = value;
    this.rowData.type = value.code;
    this.selected = value;
    this.updateSessionDecisionEvent.emit(this.rowData);
  }
}
