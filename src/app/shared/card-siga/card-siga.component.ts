import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ListValeur } from 'app/pages/dossiers/dossiers.interface';

import { ComponentViewRightMode, DossierService } from '../../pages/dossiers/dossiers.service';


/**
 * Component that update SIGA dossiers
 */
@Component({
  selector: 'siga-card',
  templateUrl: './card-siga.component.html',
  styleUrls: ['./card-siga.component.scss'],
})

export class CardComponent extends ComponentViewRightMode implements OnInit {

  @Input() listValeur: ListValeur;
  @Input() typeCard: string;
  @Input() viewRight: boolean;
  @Output() deleteEventEmitter: EventEmitter<ListValeur> = new EventEmitter();

  constructor(
    private _dossierService: DossierService,
  ) {
    super(_dossierService);
  }
  /**
   * Initializes the form and the specific inputs
   */
  ngOnInit() {
  }
  /**
   *Dont' show pop up when we close an value
   * @param event
   */
  onDeleteEvent(event) {
    if (event) {
      event.stopPropagation();
    }
    this.deleteEventEmitter.emit(this.listValeur);
  }
}
