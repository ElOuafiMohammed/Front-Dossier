import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SessionDecision } from 'app/pages/dossiers/dossier/dossier.interface';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import NumberUtils from 'app/shared/utils/number-utils';
import { ViewCell } from 'ng2-smart-table';

@Component({
  selector: 'siga-select-input-session',
  templateUrl: './select-session.component.html',
  styleUrls: ['./select-session.component.scss']
})
export class SelectSessionComponent implements OnInit, ViewCell {
  @Input() value: any;
  annee: any;
  errorYear = false;
  indexSelect = 0;
  sessions: SessionDecision[] = [];
  selected: SessionDecision = null;
  listRowData: any[] = [];
  @Input() rowData: any;
  @Output() editApplicationEventSelect: EventEmitter<any> = new EventEmitter();
  anneeControl: FormControl = new FormControl(this.annee);

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  constructor(private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.point();
    if (this.rowData) {
      this.annee = this.rowData.anneeEngagPrevi;
    }
    if (this.rowData && this.rowData.beneficiaire && !this.rowData.beneficiaire.actif) {
      this.anneeControl.disable()
    }
    if (this.value) {
      this.anneeControl.setValue(this.value.annee)
      this.annee = this.value.annee;
    }
  }

  change(value: SessionDecision) {
    this.value = value;
    this.rowData.sessionDecisionPrevi = value;
    this.rowData.anneeEngagPrevi = value.annee;
    this.anneeControl.setValue(value.annee);
    this.errorYear = false;
    this.editApplicationEventSelect.emit(this.rowData);
  }

  /**
  *Character no supported
  * @param control
  */
  onlyNumber(control: any, event?: any) {
    const positionInit = event && event.target ? event.target.selectionStart : 0;
    control.setValue(NumberUtils.onlyNumber(control.value));
    if (event && event.target) {
      event.target.selectionEnd = positionInit;
    }
  }
  /**
   *  get the selected element from list
   */
  point() {
    let found = false;
    this.annee = this.rowData.sessionDecisionPrevi;
    for (let i = 0; i < this.sessions.length; i++) {
      if (this.rowData.sessionDecisionPrevi !== null && this.sessions[i].id === this.rowData.sessionDecisionPrevi.id) {
        this.selected = this.sessions[i];
        found = true;
      }
    }
    if (!found) {
      this.selected = this.value;
    }
  }

  /**
 *
 * @param control
 */
  onBlur(control) {
    if (control) {
      const annee = this.anneeControl.value;
      if (annee && annee.toString().length === 4 && annee < 1950) {
        this.anneeControl.setErrors({ 'matDatepickerMin': true });
        this.errorYear = true;
      }
      if (annee && annee.toString().length === 4 && annee < new Date().getFullYear()) {
        this.anneeControl.setErrors({ 'matDatepickerPrev': true });
        this.errorYear = true;
      }
      if (annee && annee.toString().length === 4 && annee > 2050) {
        this.anneeControl.setErrors({ 'matDatepickerMax': true });
        this.errorYear = true;
      }
      if (annee && annee.toString().length < 4) {
        this.anneeControl.setErrors({ 'minlength': true });
        this.errorYear = true;
      }
      if (annee && annee.toString().length > 4) {
        this.anneeControl.setErrors({ 'maxlength': true });
        this.errorYear = true;
      }
      if (control.errors === null) {
        this.errorYear = false;
        this.rowData.anneeEngagPrevi = control.value;
        this.rowData.sessionDecisionPrevi = null;
        this.selected = null;
        this.editApplicationEventSelect.emit(this.rowData);
      } else {
        this.rowData.anneeEngagPrevi = control.value;
        this.rowData.sessionDecisionPrevi = null;
        this.editApplicationEventSelect.emit(this.rowData);
      }
    }
  }

  validitySessionDecisionAnnee(): boolean {

    if (this.selected) {
      const dateCourante = new Date();
      dateCourante.setHours(0, 0, 0, 0);
      const dateSelected = new Date(this.datePipe.transform(this.selected.date, 'yyyy-MM-dd'));
      dateSelected.setHours(0, 0, 0, 0);

      if (dateSelected <= dateCourante) {
        return true;
      }
    }
    return false;

  }

  partOfList(selected: SessionDecision): boolean {
    if (selected !== null) {
      for (let i = 0; i < this.sessions.length; i++) {
        if (this.sessions[i].id === selected.id) {
          return true;
        }
      }
    }
    return false;
  }

  clearSession() {
    this.selected = null;
    this.rowData.sessionDecisionPrevi = null;
    if (this.annee < new Date().getFullYear()) {
      this.rowData.anneeEngagPrevi = null;
      this.annee = null;
      this.anneeControl.setValue(null);
    }
    this.editApplicationEventSelect.emit(this.rowData);
  }
}
