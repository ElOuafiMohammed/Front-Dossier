import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NiveauPriorite } from 'app/pages/dossiers/dossier/dossier.interface';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { ViewCell } from 'ng2-smart-table';

@Component({
  selector: 'siga-select-input-priorite',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit, ViewCell {
  public value: any;

  indexSelect = 0;
  priorites: NiveauPriorite[] = [];
  selected: NiveauPriorite = null;

  @Input() rowData: any;
  @Output() editApplicationEventSelect: EventEmitter<any> = new EventEmitter();

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  constructor() { }

  ngOnInit() {
    this.point();
  }


  change(value: NiveauPriorite) {
    this.value = value;
    this.rowData.priorite = value;
    this.editApplicationEventSelect.emit(this.rowData);
  }

  /**
   *  get the selected element from list
   */
  point() {
    let found = false;
    for (let i = 0; i < this.priorites.length; i++) {
      if (this.rowData.priorite !== null && this.priorites[i].id === this.rowData.priorite.id) {
        this.selected = this.priorites[i];
        found = true;
      }
    }
    if (!found) {
      this.selected = this.value;
    }
  }
}
