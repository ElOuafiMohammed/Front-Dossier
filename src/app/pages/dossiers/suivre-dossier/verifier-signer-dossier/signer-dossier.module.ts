import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BenefciaireValidateComponent } from 'app/pages/dossiers/validate-dossier/benefciaire/benefciaire.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { SignerDossierComponent } from 'app/pages/dossiers/suivre-dossier/verifier-signer-dossier/signer-dossier.component';
import { SignerDossierRoutingModule } from 'app/pages/dossiers/suivre-dossier/verifier-signer-dossier/signer-dossier-routing.module';
import { NgaModule } from 'app/theme/nga.module';
import { CritereCardSignerRechercheComponent } from 'app/pages/dossiers/suivre-dossier/verifier-signer-dossier/criteres-card-recherche/criteres-card-signer-recherche.component';

@NgModule({
  imports: [
    CommonModule,
    SignerDossierRoutingModule,
    NgaModule,
    Ng2SmartTableModule
  ],
  declarations: [
    SignerDossierComponent,
    CritereCardSignerRechercheComponent
  ]
})
export class SignerDossierModule { }
