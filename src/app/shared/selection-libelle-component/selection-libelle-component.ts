import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

@Component({
  selector: 'siga-app-input-libelle',
  templateUrl: './selection-libelle-component.html',
  styleUrls: ['./selection-libelle-component.scss']
})
export class SelectionLibelleComponent implements ViewCell {


  public value: string;
  @Input() rowData: any;
  @Output() editApplicationEvent: EventEmitter<any> = new EventEmitter();

  // rencoie le rowData au parent
  onClick() {
    this.editApplicationEvent.emit(this.rowData);
  }

}
