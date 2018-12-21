import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SessionDecision } from 'app/pages/dossiers/dossier/dossier.interface';
import { ViewCell } from 'ng2-smart-table';

@Component({
  selector: 'siga-annee-input',
  templateUrl: './annee-input.component.html',
  styleUrls: ['./annee-input.component.scss']
})
export class AnneeInputComponent implements OnInit, ViewCell {
 value = 0;

  indexSelect = 0;
  sessions: SessionDecision[] = [];
  selected: SessionDecision = null;
  errorYear = false;
  @Input() rowData: any;
  @Output() editApplicationEventSelect: EventEmitter<any> = new EventEmitter();
  index_tab_annee = 0;
  control: FormControl = new FormControl(this.value);
  constructor() { }

  ngOnInit() {
    if (this.rowData) {
      this.value = this.rowData.anneeEngagPrevi;
    }
  }
/**
 *
 * @param control
 */
  onBlur(control) {
if (control) {
      const annee = control.value;
      if (annee && annee.toString().length === 4 && annee < 1950) {
        this.control.setErrors({ 'matDatepickerMin': true });
        this.errorYear = true;
      }
      if (annee && annee.toString().length === 4 && annee < new Date().getFullYear()) {
        this.control.setErrors({ 'matDatepickerPrev': true });
        this.errorYear = true;
      }
      if (annee && annee.toString().length === 4 && annee > 2050) {
        this.control.setErrors({ 'matDatepickerMax': true });
        this.errorYear = true;
      }
      if (annee && annee.toString().length < 4) {
        this.control.setErrors({ 'minlength': true });
        this.errorYear = true;
      }
      if (annee && annee.toString().length > 4) {
        this.control.setErrors({ 'maxlength': true });
        this.errorYear = true;
      }
      if (control.errors === null) {
        this.errorYear = false;
        this.rowData.anneeEngagPrevi = control.value ;
        this.rowData.sessionDecisionPrevi = null;
        this.editApplicationEventSelect.emit(this.rowData);
      } else {
        this.editApplicationEventSelect.emit(null);
      }
    }
  }

}
