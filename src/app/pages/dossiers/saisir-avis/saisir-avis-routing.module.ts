import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanDeactivateGuardAvis } from 'app/core/injectables/can-deactivate-guard.service';

import { SaisirAvisComponent } from './saisir-avis/saisir-avis.component';

const routes: Routes = [
  {
    path: '',
    component: SaisirAvisComponent,
    canDeactivate: [CanDeactivateGuardAvis]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SaisirAvisRoutingModule { }
