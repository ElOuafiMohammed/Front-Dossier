import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { NgaModule } from '../../../theme/nga.module';
import {
  CriteresSaisirAvisComponent,
} from './criteres-card-saisir-avis/criteres-saisir-avis/criteres-saisir-avis.component';
import { SaisirAvisRoutingModule } from './saisir-avis-routing.module';
import { SaisirAvisComponent } from './saisir-avis/saisir-avis.component';

@NgModule({
  imports: [
    CommonModule,
    SaisirAvisRoutingModule,
    Ng2SmartTableModule,
    NgaModule
  ],
  declarations: [CriteresSaisirAvisComponent, SaisirAvisComponent]
})
export class SaisirAvisModule { }
