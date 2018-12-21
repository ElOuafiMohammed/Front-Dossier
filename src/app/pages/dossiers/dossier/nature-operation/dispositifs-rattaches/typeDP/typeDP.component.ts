import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DispositifPartenariatOperation, TypeDispositif } from 'app/pages/dossiers/dossier/dossier.interface';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { ViewCell } from 'ng2-smart-table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'siga-typedp',
  templateUrl: './typeDP.component.html',
  styleUrls: ['./typeDP.component.scss'],
})

export class TypeDPComponent implements OnInit, OnDestroy, ViewCell {

  /**
   * Current typeDispositif value of form
   */
  public value: any;

  private unsubscribe = new Subject<void>();
  /**
   * Table of dispositif
   */
  @Input() rowData: DispositifPartenariatOperation;


  /**
   *Event of current dispositif updated
   */
  @Output() updateDispositifEvent: EventEmitter<any> = new EventEmitter();

  /**
   * List of typeDispositif
   */
  @Input() typesDispositif: TypeDispositif[];

  /**
  * Control of input of typeDispositif
  */
  control: FormControl;

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  constructor(

  ) { }


  ngOnInit() {
    this.control = new FormControl(this.value);
    this.setControlListenner();
  }


  setControlListenner() {
    this.control.valueChanges.pipe(takeUntil(this.unsubscribe))
      .subscribe((typeDispositif: TypeDispositif) => {
        this.rowData.dispositifPartenariat.typeDispositif = typeDispositif;
        this.rowData.typeDispositifPartenariat = typeDispositif;
        this.updateDispositifEvent.emit(this.rowData);
      })
  }


  /**
   * Function to open other window
   * @param event: event click
   */
  goOtherWindow(event) {
    if (event) {
      window.open(this.rowData.urlFrontDispositifPartenariat, '_blank', 'toolbar=yes,scrollbars=yes,resizable=yes,top=80,left=80,width=1200');
    }
  }

  /**
   * manage changes value of current typeDispsoitif
   * @param value: typeDispositif changing
   */
  change(value: TypeDispositif) {
    this.value = value;
    this.rowData.typeDispositifPartenariat = value;
  }

  compareFn(c1: TypeDispositif, c2: TypeDispositif): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  ngOnDestroy() {

    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
