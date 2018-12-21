import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { NgaModule } from '../../../theme/nga.module';
import { CritereCardPrepareSessionComponent } from './criteres-card-recherche/criteres-card-prepare-session.component';
import { PrepareDossierSessionRoutingModule } from './prepare-dossier-session-routing.module';
import { PrepareDossierSessionComponent } from './prepare-dossier-session.component';
import { NatureOperationCardComponent } from '../dossier/nature-operation/nature-operation-card/nature-operation-card.component';

@NgModule({
  imports: [
    CommonModule,
    PrepareDossierSessionRoutingModule,
    Ng2SmartTableModule,
    NgaModule
  ],
  declarations: [CritereCardPrepareSessionComponent, PrepareDossierSessionComponent, NatureOperationCardComponent]
})
export class PrepareDossierSessionModule { }
