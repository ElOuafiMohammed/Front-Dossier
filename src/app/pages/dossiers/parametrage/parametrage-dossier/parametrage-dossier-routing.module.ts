import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  CanDeactivateGuardLigne,
  CanDeactivateGuardListValeur,
  CanDeactivateGuardNatures,
  CanDeactivateGuardSessionDecision,
} from '../../../../core/injectables/can-deactivate-guard.service';
import { EnumParametrage } from '../../dossier/enumeration/enumerations';
import { ParametrageLigneComponent } from './parametrage-ligne/parametrage-ligne.component';
import { ParametrageListValeurComponent } from './parametrage-liste-valeur/parametrage-list-valeur.component';
import { ParametrageNatureOperationComponent } from './parametrage-nature-operation/parametrage-nature-operation.component';
import { ParametrageSessionDecisionComponent } from './parametrage-session-decision/parametrage-session-decision.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: EnumParametrage.A_LISTVAL,
        component: ParametrageListValeurComponent,
        canDeactivate: [CanDeactivateGuardListValeur]
      },
      {
        path: EnumParametrage.B_OP,
        component: ParametrageNatureOperationComponent,
        canDeactivate: [CanDeactivateGuardNatures]
      },
      {
        path: EnumParametrage.C_SESSION,
        component: ParametrageSessionDecisionComponent,
        canDeactivate: [CanDeactivateGuardSessionDecision]
      },
      {
        path: EnumParametrage.D_LIGNE,
        component: ParametrageLigneComponent,
        canDeactivate: [CanDeactivateGuardLigne]
      },
      {
        path: EnumParametrage.E_FINANCEUR
        // component: '',
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParametrageDossierRoutingModule { }
