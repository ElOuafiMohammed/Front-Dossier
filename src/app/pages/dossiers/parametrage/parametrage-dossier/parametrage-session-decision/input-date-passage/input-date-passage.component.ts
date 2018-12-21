import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SessionDecision } from '../../../../dossier/dossier.interface';
import { FrenchDateRegex } from '../../../../dossiers.interface';




@Component({
  selector: 'siga-app-input-date-passage',
  templateUrl: './input-date-passage.component.html',
  styleUrls: ['./input-date-passage.component.scss']
})
export class InputDatePassageComponent implements OnInit, OnDestroy {

  public value: string;
  @Input() rowData: SessionDecision;
  @Output() updateSessionDecisionEvent: EventEmitter<any> = new EventEmitter();
  formSessionDecision: FormGroup;
  index_tab_date = 0;

  get dateControl() { return this.formSessionDecision.get('date'); }
  minDate = new Date(1950, 0, 1);
  dateRegex: RegExp = FrenchDateRegex;

  private unsubscribe = new Subject<void>();

  constructor(
    private modalService: MatDialog,
    private _formBuilder: FormBuilder,
    public translate: TranslateService
  ) {

  }

  ngOnInit() {
    this.formSessionDecision = this._formBuilder.group({
      date: [this.value, [Validators.required]],
    });
    this.setControlDate();
  }

  /**
  * Control sur la validié de la date
  * Véification sur la longuer de la date saisie :
  * exemple 010319999 et 01/03/19999
  * ne fonctionnent pas
  */
  setControlDate() {
    this.dateControl.valueChanges.pipe(takeUntil(this.unsubscribe))
      .subscribe((value) => {
        if (typeof value !== 'number' && typeof value !== 'string') {
          this.rowData.dateError = false;
          // this.rowData.hasError = true;
          if (value && value._i && !(value._i instanceof Object)) {
            if (!isNaN(Number(value._i)) && value._i.length > 8) {
              this.dateControl.setErrors({ 'dateLength': true });
              this.rowData.dateError = true;
              this.rowData.hasError = true;
            } else if (isNaN(Number(value._i)) && value._i.length > 10) {
              this.dateControl.setErrors({ 'dateLength': true });
              this.rowData.hasError = true;
              this.rowData.dateError = true;
            } else if (!this.dateRegex.test(value._i)) {
              // vérifie que la date respecte le format jj/mm/aaaa
              this.dateControl.setErrors({ 'wrongFormat': true });
              this.rowData.hasError = true;
              this.rowData.dateError = true;
            } else {
              this.rowData.dateError = false;
            }
          }
          if (!this.rowData.dateError) {
            if (this.dateControl.hasError('matDatepickerMin')
              || this.dateControl.hasError('erreurDateValid')
              || this.dateControl.hasError('matDatepickerParse')
              || this.dateControl.hasError('required')) {
              this.rowData.hasError = true;
              this.rowData.dateError = true;
            } else {
              this.rowData.dateError = false;
            }
          }
          if (value && value._d && value._d !== this.rowData.date) {
            this.rowData.modif = true;
          }
          if (value && value._d) {
            this.rowData.date = value._d;
          } else {
            this.rowData.hasError = true;
            this.rowData.dateError = true;
            this.rowData.modif = true;
          }
          this.updateSessionDecisionEvent.emit(this.rowData);

        } else {
          this.dateControl.setErrors({ 'matDatepickerParse': true });
          this.rowData.hasError = true;
          this.rowData.dateError = true;
          this.updateSessionDecisionEvent.emit(this.rowData);
        }

      });
  }

  /**
  * Destroys pending subscriptions
  */
  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe.next();
      this.unsubscribe.complete();
    }
  }

}
