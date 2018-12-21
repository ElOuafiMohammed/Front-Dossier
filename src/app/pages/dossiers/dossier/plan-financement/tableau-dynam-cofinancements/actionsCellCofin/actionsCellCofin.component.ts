import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ViewCell } from 'ng2-smart-table';

@Component({
  selector: 'siga-input-cell-cofin-action',
  templateUrl: './actionsCellCofin.component.html',
  styleUrls: ['./actionsCellCofin.component.scss']
})
export class ActionsCellCofinComponent implements OnInit, ViewCell {


  @Input() value: string | number;
  @Input() rowData: any;

  @Output() deleteApplicationEvent: EventEmitter<any> = new EventEmitter();

  constructor(
    private modalService: MatDialog
  ) {

  }

  ngOnInit() {

  }

  deleteRow() {
    this.deleteApplicationEvent.emit(this.rowData);
  }

}


