import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NgaModule } from '../../../theme/nga.module';
import { CreateDossierRoutingModule } from './create-dossier-routing.module';
import { CreateDossierComponent } from './create-dossier.component';

@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    CreateDossierRoutingModule
  ],
  declarations: [CreateDossierComponent]
})
export class CreateDossierModule { }
