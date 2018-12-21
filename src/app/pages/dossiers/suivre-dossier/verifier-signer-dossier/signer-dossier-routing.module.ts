import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignerDossierComponent } from './signer-dossier.component';

const routes: Routes = [
  {
    path: '',
    component: SignerDossierComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SignerDossierRoutingModule { }
