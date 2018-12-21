import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { CreateDossierComponent } from 'app/pages/dossiers/create-dossier/create-dossier.component';
import { DossierComponent } from 'app/pages/dossiers/dossier/dossier.component';
import { GererPrevisionnelleComponent } from 'app/pages/dossiers/gerer-prevesionnel-dossier/gerer-previsionnelle.component';
import {
  ParametrageLigneComponent,
} from 'app/pages/dossiers/parametrage/parametrage-dossier/parametrage-ligne/parametrage-ligne.component';
import {
  ParametrageListValeurComponent,
} from 'app/pages/dossiers/parametrage/parametrage-dossier/parametrage-liste-valeur/parametrage-list-valeur.component';
import {
  ParametrageNatureOperationComponent,
} from 'app/pages/dossiers/parametrage/parametrage-dossier/parametrage-nature-operation/parametrage-nature-operation.component';
import {
  ParametrageSessionDecisionComponent,
} from 'app/pages/dossiers/parametrage/parametrage-dossier/parametrage-session-decision/parametrage-session-decision.component';
import { SaisirAvisComponent } from 'app/pages/dossiers/saisir-avis/saisir-avis/saisir-avis.component';

@Injectable()
export class CanDeactivateGuardCreateDossier implements CanDeactivate<CreateDossierComponent> {
  canDeactivate(component: CreateDossierComponent, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return component.canDeactivate();
  }
}

@Injectable()
export class CanDeactivateGuardDossier implements CanDeactivate<DossierComponent> {
  canDeactivate(component: DossierComponent, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return component.canDeactivate();
  }
}

@Injectable()
export class CanDeactivateGuardListValeur implements CanDeactivate<ParametrageListValeurComponent> {
  canDeactivate(component: ParametrageListValeurComponent, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return component.canDeactivate();
  }
}

@Injectable()
export class CanDeactivateGuardLigne implements CanDeactivate<ParametrageLigneComponent> {
  canDeactivate(component: ParametrageLigneComponent, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return component.canDeactivate();
  }
}

@Injectable()
export class CanDeactivateGuardNatures implements CanDeactivate<ParametrageNatureOperationComponent> {
  canDeactivate(component: ParametrageNatureOperationComponent, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return component.canDeactivate();
  }
}

@Injectable()
export class CanDeactivateGuardSessionDecision implements CanDeactivate<ParametrageSessionDecisionComponent> {
  canDeactivate(component: ParametrageSessionDecisionComponent, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return component.canDeactivate();
  }
}

@Injectable()
export class CanDeactivateGuardAvis implements CanDeactivate<SaisirAvisComponent> {
  canDeactivate(component: SaisirAvisComponent, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return component.canDeactivate();
  }
}


@Injectable()
export class CanDeactivateGuardGestionPrev implements CanDeactivate<GererPrevisionnelleComponent> {
  canDeactivate(component: GererPrevisionnelleComponent, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return component.canDeactivate();
  }
}
