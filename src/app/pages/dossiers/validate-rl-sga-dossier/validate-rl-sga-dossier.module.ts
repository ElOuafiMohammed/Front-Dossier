import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  CritereCardRlSgaRechercheComponent,
} from 'app/pages/dossiers/validate-rl-sga-dossier/criteres-card-recherche/criteres-card-rl-sga-recherche.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { NgaModule } from '../../../theme/nga.module';
import { ValidateRlSgaDossierRoutingModule } from './validate-rl-sga-dossier-routing.module';
import { ValidateRlSgaDossierComponent } from './validate-rl-sga-dossier.component';

@NgModule({
  imports: [
    CommonModule,
    ValidateRlSgaDossierRoutingModule,
    NgaModule,
    Ng2SmartTableModule
  ],
  declarations: [
    ValidateRlSgaDossierComponent,
    CritereCardRlSgaRechercheComponent
  ]
})
export class ValidateRlSgaDossierModule { }
