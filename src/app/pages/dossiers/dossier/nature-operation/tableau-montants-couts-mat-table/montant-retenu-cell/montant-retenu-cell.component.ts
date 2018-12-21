import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CoutsTravaux } from 'app/pages/dossiers//dossiers.interface';
import NumberUtils from 'app/shared/utils/number-utils';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';
import { ViewCell } from 'ng2-smart-table';

@Component({
  selector: 'siga-app-montant-retenu-cell',
  templateUrl: './montant-retenu-cell.component.html',
  styleUrls: ['./montant-retenu-cell.component.scss']
})
export class MontantRetenuCellComponent implements OnInit, ViewCell {

  montantPlafonNotNull = false;
  indexTabRetenu = 0;
  @Input() value = '0';
  @Input() rowData: CoutsTravaux;
  @Output() editApplicationEvent: EventEmitter<CoutsTravaux> = new EventEmitter();
  control: FormControl = new FormControl(this.value);

  rowDataHasError = false;

  constructor(private formatMonetairePipe: FormatMonetairePipe
  ) { }

  ngOnInit() {
    this.value = this.formatMonetairePipe.transform(this.value);
    if (this.montantPlafonNotNull) {
      this.control.disable();
      this.value = '';
    }
  }

  onRetenuBlur(montantRetenu: string) {
    if (!this.control.errors || this.control.hasError('maxlength')) {
      this.rowData.montantRetenu = NumberUtils.toNumber(montantRetenu);
      this.editApplicationEvent.emit(this.rowData);
    } else {
      this.editApplicationEvent.emit(null);
    }
  }
  onlyNumber(control: FormControl, event?: any) {
    control.setValue(NumberUtils.onlyNumber(control.value));
  }
  onBlur(control: FormControl) {
    const value = control.value ? control.value : '0'
    this.control.setValue(this.formatMonetairePipe.transform(value));
    this.onRetenuBlur(value)
  }


  /**
     * Remove space on the number
     * @param control 
     * @param event 
     */
  onClick(control: FormControl, event: any) {
    this.onlyNumber(control, event)
  }
}
