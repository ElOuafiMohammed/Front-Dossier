import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { ViewCell } from 'ng2-smart-table';

import { Financeur } from '../tableau-dynam-cofinancements-interface';

@Component({
  selector: 'siga-select-input-libelle-cell',
  templateUrl: './select-input-cofinanceur.component.html',
  styleUrls: ['./select-input-cofinanceur.component.scss']
})
export class SelectInputCofinanceurComponent implements OnInit, ViewCell {
  public value: any;
  indexSelect = 0;

  @Input() rowData: any;
  @Output() editApplicationEventSelect: EventEmitter<Financeur[]> = new EventEmitter();

  lines: Financeur[] = [];
  selected: Financeur = null;
  freeLines: Financeur[] = [];

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

  change(value: Financeur) {
    const libelle: Financeur[] = [];
    // put the element to be selected
    // libelle.push(this.value);
    // put the current selected element
    libelle.push(value);
    this.value = value;
    this.rowData.financeur = value;
    this.editApplicationEventSelect.emit(libelle);
  }

  /**
   * get the selected element from list
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
      this.freeLines.push(line);
    })
  }

  libelleOnType(financeurPublic: boolean): string {
    return financeurPublic ? 'Public' : 'Privé';
  }
}