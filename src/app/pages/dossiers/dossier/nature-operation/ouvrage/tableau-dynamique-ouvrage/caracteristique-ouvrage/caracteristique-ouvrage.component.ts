import { Component, Input, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

import { DossierService } from '../../../../../dossiers.service';
import { Caracteristique } from '../../../../dossier.interface';

@Component({
  selector: 'siga-caracteristique-ouvrage',
  templateUrl: './caracteristique-ouvrage.component.html',
  styleUrls: ['./caracteristique-ouvrage.component.scss']
})
export class CaracteristiqueOuvrageComponent implements OnInit {
  @Input('settings') settings: any = { actions: false };
  @Input('source') source: LocalDataSource = new LocalDataSource();
  @Input('caracteristique') caracteristique: Caracteristique[] = [];

  constructor(public dossierService: DossierService) { }

  ngOnInit() {
  }
}
