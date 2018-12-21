import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { NgaModule } from '../../../theme/nga.module';
import { CritereCardRechercheComponent } from './criteres-card-recherche/criteres-card-recherche.component';
import { ValidateDossierRoutingModule } from './validate-dossier-routing.module';
import { ValidateDossierComponent } from './validate-dossier.component';

@NgModule({
  imports: [
    CommonModule,
    ValidateDossierRoutingModule,
    Ng2SmartTableModule,
    NgaModule
  ],
  declarations: [
    CritereCardRechercheComponent,
    ValidateDossierComponent
  ]
})
export class ValidateDossierModule { }
