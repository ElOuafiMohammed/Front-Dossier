import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';


@Component({
  selector: 'siga-precision-cofin',
  templateUrl: './precision.component.html',
  styleUrls: ['./precision.component.scss']
})
export class PrecisionComponent implements OnInit {


  public value: string;
  indexPrecision = 0;
  @Input() rowData: any;
  @Output() editApplicationEvent: EventEmitter<any> = new EventEmitter();
  control: FormControl = new FormControl(this.value);



  constructor(
    private modalService: MatDialog
  ) {

  }
  ngOnInit() {
  }
  onPrevBlur() {
    if (!this.control.errors) {
      this.rowData.precision = this.value;
      this.editApplicationEvent.emit(this.rowData);
    } else {
      this.editApplicationEvent.emit(this.control.errors);
    }
  }
}
