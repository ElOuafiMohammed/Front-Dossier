import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import NumberUtils from 'app/shared/utils/number-utils';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';
import { ViewCell } from 'ng2-smart-table';

import { CoFinanceur } from '../tableau-dynam-cofinancements-interface';


@Component({
  selector: 'siga-input-cell-cofin',
  templateUrl: './inputCellTaux.component.html',
  styleUrls: ['./inputCellTaux.component.scss']
})
export class InputCellTauxComponent implements OnInit, ViewCell {
  public value: string;
  @Input() rowData: any;
  @Output() editApplicationEvent: EventEmitter<CoFinanceur> = new EventEmitter();
  control: FormControl = new FormControl(this.value);
  indexTauxCofin = 0;
  onKeyTouched = false;
  tauxError = false;

  constructor(
    private modalService: MatDialog,
    private formatMonetairePipe: FormatMonetairePipe
  ) { }

  ngOnInit() {
    this.control = new FormControl(this.value);
    this.value = this.value ? this.limitDecimalTo2(this.value).toString() : '0';
    if (this.rowData && this.rowData.financeur && !this.rowData.financeur.id) {
      this.control.disable();
    }
  }

  onPourcentAid(tauxAid: string) {
    if (!this.control.errors) {
      this.rowData.tauxAide = parseFloat(tauxAid);
      this.editApplicationEvent.emit(this.rowData);
    } else {
      this.editApplicationEvent.emit(null);
    }
  }

  onBlur(control: FormControl) {
    const value = control.value ? control.value : '0'
    this.control.setValue(NumberUtils.onlyDecimalLimit(value, 3, 2))
  }

  onlyDecimalTaux(value: any, event) {
    const positionInit = event && event.target ? event.target.selectionStart : 0;
    if (value) {
      this.control.setValue(NumberUtils.onlyDecimalLimit(value, 3, 2));
    }
    if (event && event.target) {
      event.target.selectionEnd = positionInit;
    }
  }

  limitDecimalTo2(value: any): number {
    const factor = Math.pow(10, 2);
    return Math.round(value * factor) / factor;
  }
}
