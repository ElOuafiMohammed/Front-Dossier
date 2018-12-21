import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { NgaModule } from '../../../theme/nga.module';
import { CritereCardComponent } from './criteres-card/criteres-card.component';
import { RechercheDossierRoutingModule } from './recherche-dossier-routing.module';
import { RechercheDossierComponent } from './recherche-dossier.component';

@NgModule({
  imports: [
    CommonModule,
    RechercheDossierRoutingModule,
    Ng2SmartTableModule,
    NgaModule
  ],
  declarations: [
    CritereCardComponent,
    RechercheDossierComponent
  ]
})
export class RechercheDossierModule { }
