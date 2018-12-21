import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material';
import { ViewCell } from 'ng2-smart-table';

@Component({
  selector: 'siga-input-cell1',
  templateUrl: './checkboxOuvrageCell.component.html',
  styleUrls: ['./checkboxOuvrageCell.component.scss']
})
export class CheckboxOuvrageCellComponent implements OnInit, ViewCell {

  @Input() value: any;
  @Input() rowData: any;
  @Output() editApplicationEvent: EventEmitter<Boolean> = new EventEmitter();

  ngOnInit() {
    this.value = this.rowData.checked;
  }
  onCheckBoxChange(event: MatCheckboxChange) {
    this.value = !this.value;
    this.rowData.checked = this.value;
    this.editApplicationEvent.emit(true);
  }

}


