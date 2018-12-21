import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

import { ListValeur } from '../../../dossiers.interface';
import { DossierService, ComponentViewRightMode } from '../../../dossiers.service';
import { NatureOperation } from '../../dossier.interface';

@Component({
  selector: 'nature-operation-card',
  templateUrl: './nature-operation-card.component.html',
  styleUrls: ['./nature-operation-card.component.scss'],
})
export class NatureOperationCardComponent extends ComponentViewRightMode implements OnInit {
  @Input() listValeur: NatureOperation;
  @Input() typeCard: string;
  @Input() viewRight: boolean;
  @Output() deleteEventEmitter: EventEmitter<NatureOperation> = new EventEmitter();
  viewLivelle: boolean;
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

  onDeleteEvent() {
    this.deleteEventEmitter.emit(this.listValeur);
  }
}
