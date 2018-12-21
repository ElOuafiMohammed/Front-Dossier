import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { ViewCell } from 'ng2-smart-table';

import { Libelle } from '../tableau-dynam-prev-interface';

@Component({
  selector: 'siga-select-input-libelle-cell',
  templateUrl: './select-input-libelle.component.html',
  styleUrls: ['./select-input-libelle.component.scss']
})
export class SelectInputLibelleComponent implements OnInit, ViewCell {
  public value: any;

  indexSelect = 0;
  lines: Libelle[] = [];
  selected: Libelle = null;
  freeLines: Libelle[] = [];

  @Input() rowData: any;
  @Output() editApplicationEventSelect: EventEmitter<Libelle[]> = new EventEmitter();

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  constructor(private modalService: MatDialog) { }

  ngOnInit() {
    if (this.value.id != null) {
      this.point();
    } else {
      this.selected = this.value;
    }
    this.getFreeLines();
  }

  change(value: Libelle) {
    const libelle: Libelle[] = [];
    // put the element to be selected
    libelle.push(this.value);
    // put the current selected element
    libelle.push(value);
    this.value = value;
    this.rowData.ligne = value;
    this.editApplicationEventSelect.emit(libelle);
  }

  /**
   *  get the selected element from list
   */
  point() {
    for (let i = 0; i < this.lines.length; i++) {
      if (this.lines[i].id === this.value.id) {
        this.selected = this.lines[i];
      }
    }
  }

  getFreeLines(): void {
    this.freeLines = [];
    this.lines.forEach(line => {
      if (this.selected.id === line.id || line.disable === false) {
        this.freeLines.push(line);
      }
    })
  }
}
