import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgaModule } from 'app/theme/nga.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { AnneeInputComponent } from './annee-input/annee-input.component';
import { BenefciaireComponent } from './benefciaire/benefciaire.component';
import { CritereCardGererPrevisionnelleComponent } from './criteres-card/criteres-card-gerer-previsionnelle.component';
import { GererPrevesionnelDossierRoutingModule } from './gerer-prevesionnel-dossier-routing.module';
import { GererPrevisionnelleComponent } from './gerer-previsionnelle.component';
import { IntituleComponent } from './intitule/intitule.component';
import { SelectComponent } from './priorite-input/select.component';
import { SelectSessionComponent } from './session-input/select-session.component';

@NgModule({
  imports: [
    CommonModule,
    GererPrevesionnelDossierRoutingModule,
    Ng2SmartTableModule,
    NgaModule.forRoot()
  ],
  declarations: [
    GererPrevisionnelleComponent,
    AnneeInputComponent,
    BenefciaireComponent,
    CritereCardGererPrevisionnelleComponent,
    IntituleComponent,
    SelectComponent,
    SelectSessionComponent
  ],
  entryComponents: [
    AnneeInputComponent,
    BenefciaireComponent,
    IntituleComponent,
    SelectComponent,
    SelectSessionComponent
  ]
})
export class GererPrevesionnelDossierModule { }
