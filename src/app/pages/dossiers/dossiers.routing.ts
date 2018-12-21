import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IsBackendConfigReady } from 'app/core/injectables/can-activate-guard.service';
import { CanDeactivateGuardDossier } from 'app/core/injectables/can-deactivate-guard.service';

import { AccueilComponent } from './accueil/accueil.component';
import { DossierComponent } from './dossier/dossier.component';

export const routes: Routes = [
  {
    path: '',
    canActivate: [IsBackendConfigReady],
    children: [
      { path: '', redirectTo: 'accueil', pathMatch: 'full' },
      { path: 'accueil', component: AccueilComponent },
      {
        path: 'creation',
        loadChildren: 'app/pages/dossiers/create-dossier/create-dossier.module#CreateDossierModule'
      },
      {
        path: 'dossier/:dossierId',
        component: DossierComponent,
        canDeactivate: [CanDeactivateGuardDossier]
      },
      {
        path: 'recherche',
        loadChildren: 'app/pages/dossiers/recherche-dossier/recherche-dossier.module#RechercheDossierModule'
      },
      {
        path: 'validerSiege',
        loadChildren: 'app/pages/dossiers/validate-rl-sga-dossier/validate-rl-sga-dossier.module#ValidateRlSgaDossierModule'
      },
      {
        path: 'valider',
        loadChildren: 'app/pages/dossiers/validate-dossier/validate-dossier.module#ValidateDossierModule'
      },
      {
        path: 'saisirAvis',
        loadChildren: 'app/pages/dossiers/saisir-avis/saisir-avis.module#SaisirAvisModule'
      },
      {
        path: 'attribuerAides',
        loadChildren: 'app/pages/dossiers/attribuer-aides/attribuer-aides.module#AttribuerAidesModule'
      },
      {
        path: 'gererPrev',
        loadChildren: 'app/pages/dossiers/gerer-prevesionnel-dossier/gerer-prevesionnel-dossier.module#GererPrevesionnelDossierModule'
      },
      {
        path: 'preparerSession',
        loadChildren: 'app/pages/dossiers/prepare-dossier-session/prepare-dossier-session.module#PrepareDossierSessionModule'
      },
      {
        path: 'parametrer',
        loadChildren: 'app/pages/dossiers/parametrage/parametrage-dossier/parametrage-dossier.module#ParametrageDossierModule'
      },
      {
        path: 'signDocAttributif',
        loadChildren: 'app/pages/dossiers/suivre-dossier/verifier-signer-dossier/signer-dossier.module#SignerDossierModule'
      },
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
