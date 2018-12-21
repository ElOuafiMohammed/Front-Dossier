import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';


@Component({
  selector: 'siga-app-action-nature-operation',
  templateUrl: './action-nature-operation.component.html',
  styleUrls: ['./action-nature-operation.component.scss']
})
export class ActionNatureOperationComponent implements OnInit {

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
