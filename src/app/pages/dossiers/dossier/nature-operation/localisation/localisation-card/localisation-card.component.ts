import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Departements } from 'app/pages/dossiers/dossiers.interface';

import { DossierService } from '../../../../dossiers.service';
import { BvGestion, Communes, Regions } from '../../../dossier.interface';


@Component({
  selector: 'siga-app-localisation-card',
  templateUrl: './localisation-card.component.html',
  styleUrls: ['./localisation-card.component.scss']
})
export class LocalisationCardComponent {
  @Input() localisationPertinente: boolean;
  @Input() region: Regions;
  @Input() departement: Departements;
  @Input() commune: Communes;
  @Input() bvGestion: BvGestion;
  @Input() viewRight: boolean = null;
  @Output() deleteEventEmitter: EventEmitter<any> = new EventEmitter();

  constructor(public dossierService: DossierService) {
  }

  onDeleteEvent() {
    if (this.region) {
      this.deleteEventEmitter.emit(this.region);
    }
    if (this.departement) {
      this.deleteEventEmitter.emit(this.departement);
    }
    if (this.commune) {
      this.deleteEventEmitter.emit(this.commune);
    }
    if (this.bvGestion) {
      this.deleteEventEmitter.emit(this.bvGestion.nom);
    }
  }

}
