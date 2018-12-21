import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { NgaModule } from '../../../theme/nga.module';
import { AttribuerAidesRoutingModule } from './attribuer-aides-routing.module';
import { AttribuerAidesComponent } from './attribuer-aides.component';
import { CriteresAttribuerAideComponent } from './criteres-attribuer-aide/criteres-attribuer-aide.component';

@NgModule({
  imports: [
    CommonModule,
    AttribuerAidesRoutingModule,
    NgaModule,
    Ng2SmartTableModule,
  ],
  declarations: [AttribuerAidesComponent, CriteresAttribuerAideComponent]
})
export class AttribuerAidesModule { }
