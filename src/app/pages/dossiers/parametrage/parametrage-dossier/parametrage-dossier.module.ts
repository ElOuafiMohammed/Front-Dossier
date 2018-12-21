import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { NgaModule } from '../../../../theme/nga.module';
import { ParametrageDossierRoutingModule } from './parametrage-dossier-routing.module';
import { ParametrageDossierComponent } from './parametrage-dossier.component';
import { CritereCardLigneComponent } from './parametrage-ligne/critere-card-ligne/critere-card-ligne.component';
import { ParametrageLigneComponent } from './parametrage-ligne/parametrage-ligne.component';
import {
  CritereCardListValeurComponent,
} from './parametrage-liste-valeur/critere-card-list-valeur/critere-card-list-valeur.component';
import { ParametrageListValeurComponent } from './parametrage-liste-valeur/parametrage-list-valeur.component';
import {
  ActionNatureOperationComponent,
} from './parametrage-nature-operation/action-nature-operation/action-nature-operation.component';
import {
  CritereCardNatureOperationComponent,
} from './parametrage-nature-operation/critere-card-nature-operation/critere-card-nature-operation.component';
import { InputFinValiditeComponent } from './parametrage-nature-operation/input-fin-validite/input-fin-validite.component';
import { InputLibelleComponent } from './parametrage-nature-operation/input-libelle/input-libelle.component';
import { InputLigneComponent } from './parametrage-nature-operation/input-ligne/input-ligne.component';
import { InputNatNumeroComponent } from './parametrage-nature-operation/input-numero/input-nat-numero.component';
import { InputThematiqueComponent } from './parametrage-nature-operation/input-thematique/input-thematique.component';
import { ParametrageNatureOperationComponent } from './parametrage-nature-operation/parametrage-nature-operation.component';
import {
  ActionSessionDecisionComponent,
} from './parametrage-session-decision/action-session-decision/action-session-decision.component';
import {
  CritereCardSessionDecisionComponent,
} from './parametrage-session-decision/critere-card-session-decision/critere-card-session-decision.component';
import { InputAnneeSdComponent } from './parametrage-session-decision/input-annee-sd/input-annee-sd.component';
import { InputDatePassageComponent } from './parametrage-session-decision/input-date-passage/input-date-passage.component';
import { InputNumeroSdComponent } from './parametrage-session-decision/input-numero/input-numero-sd.component';
import { InputTypeComponent } from './parametrage-session-decision/input-type/input-type.component';
import { ParametrageSessionDecisionComponent } from './parametrage-session-decision/parametrage-session-decision.component';

@NgModule({
  imports: [
    CommonModule,
    ParametrageDossierRoutingModule,
    Ng2SmartTableModule,
    NgaModule.forRoot()
  ],
  declarations: [
    ParametrageDossierComponent,

    ParametrageNatureOperationComponent,
    CritereCardNatureOperationComponent,
    InputThematiqueComponent,
    InputLigneComponent,
    InputNatNumeroComponent,
    InputLibelleComponent,
    InputFinValiditeComponent,
    ActionNatureOperationComponent,
    ParametrageLigneComponent,
    CritereCardLigneComponent,
    ParametrageListValeurComponent,
    CritereCardListValeurComponent,

    ParametrageSessionDecisionComponent,
    CritereCardSessionDecisionComponent,
    InputTypeComponent,
    InputAnneeSdComponent,
    InputNumeroSdComponent,
    InputDatePassageComponent,
    ActionSessionDecisionComponent
  ],
  entryComponents: [
    InputThematiqueComponent,
    InputLigneComponent,
    ActionNatureOperationComponent,
    ActionSessionDecisionComponent,
    InputTypeComponent,
    InputLibelleComponent,
    InputAnneeSdComponent,
    InputFinValiditeComponent,
    InputNatNumeroComponent,
    InputDatePassageComponent,
    InputNumeroSdComponent
  ]
})
export class ParametrageDossierModule { }
