import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ViewCell } from 'ng2-smart-table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'siga-app-code-masse-eau-cell',
  templateUrl: './code-masse-eau.component-cell.html',
  styleUrls: ['./code-masse-eau.component-cell.scss'],
})
export class CodeMasseEauCellComponent implements OnInit, OnDestroy, ViewCell {
  libelleCoutRenseigne: boolean;
  erreurMontant: any;
  @Input() rowData: any; // TODO : Add type
  @Input() value: string;

  @Output() editCodeMasseEauEvent: EventEmitter<any> = new EventEmitter();

  private unsubscribe = new Subject<void>();
  isOutOfFocus = true;

  isValueModified: boolean;

  // index_tab_eligible = 0;
  control: FormControl;
  constructor(
  ) { }

  ngOnInit() {
    this.isValueModified = this.value ? false : true;
    this.control = new FormControl(this.value);
    this.control.valueChanges.pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.isValueModified = true;
      });
  }

  onBlur() {
    this.isOutOfFocus = true;
    if (!this.control.errors) {
      this.rowData.code = this.control.value.toUpperCase();
      this.isValueModified = true;
    } else {
      this.isValueModified = false;
    }
    this.editCodeMasseEauEvent.emit(this.rowData);
  }

  onFocusEvent() {
    this.isOutOfFocus = false;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
