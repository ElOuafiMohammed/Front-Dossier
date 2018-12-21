import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CanDeactivateGuardGestionPrev } from '../../../core/injectables/can-deactivate-guard.service';
import { GererPrevisionnelleComponent } from './gerer-previsionnelle.component';

const routes: Routes = [
  {
    path: '',
    component: GererPrevisionnelleComponent,
    canDeactivate: [CanDeactivateGuardGestionPrev]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GererPrevesionnelDossierRoutingModule { }
