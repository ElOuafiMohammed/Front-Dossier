import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';
import { ViewCell } from 'ng2-smart-table';
import NumberUtils from '../../../../../../shared/utils/number-utils';

@Component({
  selector: 'siga-input-cell-cofin',
  templateUrl: './inputCellCofinAide.component.html',
  styleUrls: ['./inputCellCofinAide.component.scss']
})
export class InputCellCofinAideComponent implements OnInit, ViewCell {
  public value: string;
  indexMontAideCofin = 0;
  @Input() rowData: any;
  @Output() editApplicationEvent: EventEmitter<any> = new EventEmitter();
  control: FormControl = new FormControl(this.value);
  onKeyTouched = false;

  constructor(
    private modalService: MatDialog,
    private formatMonetairePipe: FormatMonetairePipe
  ) {
  }

  ngOnInit() {
    this.control = new FormControl(this.value);
    this.value = this.value ? this.formatMonetairePipe.transform(Math.ceil(Number(this.value))) : '0';
    if (this.rowData && this.rowData.financeur && !this.rowData.financeur.id) {
      this.control.disable();
    }
  }

  onMontantAideBlur(MontantAid: string) {
    this.rowData.montantAide = NumberUtils.toNumber(MontantAid);
    if (!this.control.errors) {
      this.rowData.montantAide = NumberUtils.toNumber(MontantAid);
      this.editApplicationEvent.emit(this.rowData);
    } else {
      this.editApplicationEvent.emit(null);
    }
  }

  

  onBlur(control: FormControl) {
    const value = control.value ? control.value : '0'
    this.control.setValue(this.formatMonetairePipe.transform(value));
  }

}
