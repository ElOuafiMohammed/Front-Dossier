import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PrepareDossierSessionComponent } from './prepare-dossier-session.component';

const routes: Routes = [
  {
    path: '',
    component: PrepareDossierSessionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrepareDossierSessionRoutingModule { }
