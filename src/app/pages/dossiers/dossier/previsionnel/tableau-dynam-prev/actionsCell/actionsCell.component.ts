import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ViewCell } from 'ng2-smart-table';

@Component({
  selector: 'siga-input-cell1',
  templateUrl: './actionsCell.component.html',
  styleUrls: ['./actionsCell.component.scss']
})
export class ActionsCellComponent implements OnInit, ViewCell {


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


