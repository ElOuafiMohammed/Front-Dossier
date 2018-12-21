import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import NumberUtils from 'app/shared/utils/number-utils';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';
import { ViewCell } from 'ng2-smart-table';

@Component({
  selector: 'siga-input-cell2',
  templateUrl: './inputCell.component.html',
  styleUrls: ['./inputCell.component.scss']
})
export class InputCellComponent implements OnInit, ViewCell {
  public value: string;
  @Input() rowData: any;
  @Output() editApplicationEvent: EventEmitter<any> = new EventEmitter();
  control: FormControl = new FormControl(this.value);
  indexPrev = 0;

  constructor(
    private modalService: MatDialog,
    private formatMonetairePipe: FormatMonetairePipe
  ) { }

  ngOnInit() {
    this.control = new FormControl(this.value)
    if (this.rowData && !this.rowData.ligne) {
      this.control.disable();
    }
    this.setControlListenner();
  }

  onMontantTravPrevBlur(montantTravauxPrev: string) {
    if (!this.control.errors || this.control.hasError('maxlength')) {
      this.rowData.montantTravauxPrev = NumberUtils.toNumber(montantTravauxPrev);
      this.editApplicationEvent.emit(this.rowData);
    } else {
      this.editApplicationEvent.emit(null);
    }
  }

  setControlListenner() {
    this.value = this.value ? this.formatMonetairePipe.transform(this.value) : '0'
  }

  onBlur(control: FormControl) {
    const value = control.value ? control.value : '0'
    this.control.setValue(this.formatMonetairePipe.transform(value))
    this.onMontantTravPrevBlur(value);
  }
}
