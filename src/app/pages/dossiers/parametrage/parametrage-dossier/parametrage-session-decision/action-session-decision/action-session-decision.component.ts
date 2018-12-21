import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';


@Component({
  selector: 'siga-app-action-session-decision',
  templateUrl: './action-session-decision.component.html',
  styleUrls: ['./action-session-decision.component.scss']
})
export class ActionSessionDecisionComponent implements OnInit {

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
