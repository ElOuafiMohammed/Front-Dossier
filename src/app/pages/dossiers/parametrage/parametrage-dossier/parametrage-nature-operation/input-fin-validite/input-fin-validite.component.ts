import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NatureOperation } from '../../../../dossier/dossier.interface';
import { FrenchDateRegex } from '../../../../dossiers.interface';


@Component({
  selector: 'siga-app-input-fin-validite',
  templateUrl: './input-fin-validite.component.html',
  styleUrls: ['./input-fin-validite.component.scss']
})
export class InputFinValiditeComponent implements OnInit, OnDestroy {

  public value: string;
  @Input() rowData: NatureOperation;
  @Output() updateNatureEvent: EventEmitter<any> = new EventEmitter();
  formNatureOperation: FormGroup;
  index_tab_dateFinValidite = 0;

  get dateFinValiditeControl() { return this.formNatureOperation.get('dateFinValidite'); }
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
    this.formNatureOperation = this._formBuilder.group({
      dateFinValidite: [this.value],
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
    this.dateFinValiditeControl.valueChanges.pipe(takeUntil(this.unsubscribe))
      .subscribe((value) => {
        if (typeof value !== 'number' && typeof value !== 'string') {
          this.rowData.dateError = false;
          // this.rowData.hasError = true;
          if (value && value._i && !(value._i instanceof Object)) {
            if (!isNaN(Number(value._i)) && value._i.length > 8) {
              this.dateFinValiditeControl.setErrors({ 'dateLength': true });
              this.rowData.dateError = true;
              this.rowData.hasError = true;
            } else if (isNaN(Number(value._i)) && value._i.length > 10) {
              this.dateFinValiditeControl.setErrors({ 'dateLength': true });
              this.rowData.hasError = true;
              this.rowData.dateError = true;
            } else if (!this.dateRegex.test(value._i)) {
              // vérifie que la date respecte le format jj/mm/aaaa
              this.dateFinValiditeControl.setErrors({ 'wrongFormat': true });
              this.rowData.hasError = true;
              this.rowData.dateError = true;
            } else {
              this.rowData.dateError = false;
            }
          }
          if (!this.rowData.dateError) {
            if (value && value._d && value._d.toISOString().substring(0, 10) < (this.rowData.dateDebutValidite).substring(0, 10)) {
              this.dateFinValiditeControl.setErrors({ 'matDatepickerMin': true });
              this.rowData.hasError = true;
              this.rowData.dateError = true;
            } else if (this.dateFinValiditeControl.hasError('erreurDateValid')
              || this.dateFinValiditeControl.hasError('matDatepickerParse')) {
              this.rowData.dateError = true;
              this.rowData.hasError = true;
            } else {
              this.rowData.dateError = false;
            }
          }
          if (value && value._d !== this.rowData.dateFinValidite) {
            this.rowData.modif = true;
          }
          if (value && value._d) {
            this.rowData.dateFinValidite = value._d;
          } else {
            this.rowData.dateFinValidite = '';
          }
          this.updateNatureEvent.emit(this.rowData);

        } else {
          this.dateFinValiditeControl.setErrors({ 'matDatepickerParse': true });
          this.rowData.hasError = true;
          this.rowData.dateError = true;
          this.updateNatureEvent.emit(this.rowData);
        }
      });
  }

  /**
  * Destroys pending subscriptions
  */
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
