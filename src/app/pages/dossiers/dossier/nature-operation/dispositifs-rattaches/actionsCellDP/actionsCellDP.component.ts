import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

import { TypeDispositif } from '../../../dossier.interface';

@Component({
  selector: 'siga-action-cell-dp',
  templateUrl: './actionsCellDP.component.html',
  styleUrls: ['./actionsCellDP.component.scss']
})
export class ActionsCellDPComponent implements OnInit, ViewCell {


  @Input() value: string | number;
  @Input() rowData: TypeDispositif;

  @Output() deleteDispositifEvent: EventEmitter<TypeDispositif> = new EventEmitter();

  constructor() { }

  ngOnInit() { }

  deleteDP() {
    this.deleteDispositifEvent.emit(this.rowData);
  }
}
