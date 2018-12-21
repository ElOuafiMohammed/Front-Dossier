import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'siga-app-actions-tableau',
  templateUrl: './actions-tableau.component.html',
  styleUrls: ['./actions-tableau.component.scss']
})
export class ActionsTableauMasseEauComponent implements OnInit {


  @Input() value: string | number;
  @Input() rowData: any;

  @Output() deleteMasseEauEvent: EventEmitter<any> = new EventEmitter();

  constructor(
  ) {

  }

  ngOnInit() {
  }

  deleteRow() {
    this.deleteMasseEauEvent.emit(this.rowData);
  }

}
