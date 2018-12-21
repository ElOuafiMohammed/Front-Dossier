import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CanDeactivateGuardCreateDossier } from '../../../core/injectables/can-deactivate-guard.service';
import { CreateDossierComponent } from './create-dossier.component';

const routes: Routes = [
  {
    path: '',
    component: CreateDossierComponent,
    canDeactivate: [CanDeactivateGuardCreateDossier]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateDossierRoutingModule { }
