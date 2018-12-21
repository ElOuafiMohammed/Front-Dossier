import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { ViewCell } from 'ng2-smart-table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Ouvrage, TypeOuvrage } from '../../tableau-dynamique-ouvrage/tableau-dynamique-ouvrage.interface';


@Component({
  selector: 'siga-select-type-ouvrage',
  templateUrl: './select-type.component.html',
  styleUrls: ['./select-type.component.scss']
})
export class SelectTypeComponent implements OnInit, OnDestroy, ViewCell {

  public value: any;
  indexSelect = 0;

  private unsubscribe = new Subject<void>();
  @Input() rowData: Ouvrage;
  @Output() updateOuvrageEvent: EventEmitter<any> = new EventEmitter();
  @Input() typesOuvrages: TypeOuvrage[];

  selected: TypeOuvrage = null;
  formOuvrage: FormGroup;

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  constructor(private modalService: MatDialog, private _formBuilder: FormBuilder) { }

  ngOnInit() {
    if (this.rowData) {
      this.value = this.rowData.typeOuvrage;
    }
    this.formOuvrage = this._formBuilder.group({
      typeOuvrage: [this.value],
    });
    if (this.value && this.value.id != null) {
      this.point();
    } else {
      this.selected = this.value;
    }
    this.setControlListenner();
  }

  setControlListenner() {
    this.formOuvrage.get('typeOuvrage').valueChanges.pipe(takeUntil(this.unsubscribe))
      .subscribe((typeOuvrage: TypeOuvrage) => {
        this.rowData.typeOuvrage = typeOuvrage;
        this.updateOuvrageEvent.emit(this.rowData);
      })
  }

  change(value: TypeOuvrage) {
    this.value = value;
    this.rowData.typeOuvrage = value;
  }

  /**
   * get the selected element from list
   */
  point() {
    for (let type of this.typesOuvrages) {
      if (type.id === this.value.id) {
        this.selected = type;
      }
    }
  }

  /**
   * allows to compare two objects
   * @param compareItem1;
   * @param compareItem2;
   */
  compareListElement(compareItem1: any, compareItem2: any) {
    return compareItem1 && compareItem2 && compareItem1.id === compareItem2.id;
  }
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
