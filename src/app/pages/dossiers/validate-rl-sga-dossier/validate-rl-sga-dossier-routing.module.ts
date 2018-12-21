import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ValidateRlSgaDossierComponent } from './validate-rl-sga-dossier.component';

const routes: Routes = [
  {
    path: '',
    component: ValidateRlSgaDossierComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ValidateRlSgaDossierRoutingModule { }
