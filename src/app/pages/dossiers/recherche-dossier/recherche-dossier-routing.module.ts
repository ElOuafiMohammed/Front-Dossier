import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RechercheDossierComponent } from './recherche-dossier.component';

const routes: Routes = [

  {
    path: '',
    component: RechercheDossierComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RechercheDossierRoutingModule { }
