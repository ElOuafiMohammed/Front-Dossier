import { NgModule } from '@angular/core';

import { IsBackendConfigReady } from './injectables/can-activate-guard.service';
import {
  CanDeactivateGuardAvis,
  CanDeactivateGuardCreateDossier,
  CanDeactivateGuardDossier,
  CanDeactivateGuardGestionPrev,
  CanDeactivateGuardLigne,
  CanDeactivateGuardListValeur,
  CanDeactivateGuardNatures,
  CanDeactivateGuardSessionDecision,
} from './injectables/can-deactivate-guard.service';

@NgModule({
  providers: [
    CanDeactivateGuardCreateDossier,
    CanDeactivateGuardDossier,
    CanDeactivateGuardListValeur,
    CanDeactivateGuardNatures,
    CanDeactivateGuardLigne,
    CanDeactivateGuardSessionDecision,
    CanDeactivateGuardAvis,
    CanDeactivateGuardGestionPrev,
    IsBackendConfigReady,
  ],
})
export class CoreModule {
}
