import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AppService } from 'app/app.service';

@Injectable()
export class IsBackendConfigReady implements CanActivate {
  constructor(
    private _appService: AppService,
    private _router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (state.url === '/accueil') {
      return true;
    }

    // if (this._appService.environment.BACKEND === '') {
    //   this._router.navigate((['/accueil']));
    //   return false;
    // }
    return true;
  }
}
