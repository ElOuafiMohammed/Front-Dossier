import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ValidateDossierComponent } from './validate-dossier.component';

const routes: Routes = [
  {
    path: '',
    component: ValidateDossierComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ValidateDossierRoutingModule { }
