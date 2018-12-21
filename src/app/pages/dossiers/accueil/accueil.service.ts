import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppService } from 'app/app.service';
import { GlobalState } from 'app/global.state';
import MethodeGenerique from 'app/shared/methodes-generiques';
import { Observable } from 'rxjs';

import { Dossier } from '../dossiers.interface';
import { CritereRemarque } from '../recherche-dossier/recherche-dossier.interface';
import { Utilisateur } from './accueil.interface';

@Injectable()
export class AccueilService {

  private _customHeaders: HttpHeaders = null;

  constructor(
    private _httpClient: HttpClient,
    private _appService: AppService,
    private _state: GlobalState
  ) {
    // SIGA-3634 : suppression setCustomHeaders
    // this.setCustomHeaders();
  }

  // SIGA-3634 : suppression setCustomHeaders
  // /**
  // * Correction bug IE pour les méthodes GET sur même domaine
  // */
  // setCustomHeaders() {
  //   this._customHeaders = new HttpHeaders({
  //     'Cache-Control': 'no-cache',
  //     'Pragma': 'no-cache',
  //     'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT'
  //   });
  // }

  getUtilisateurConnecte(): Observable<Utilisateur> {
    const url = `${this._appService.environment.BACKEND}/connexion`;
    return this._httpClient.get<Utilisateur>(url, { headers: this._customHeaders });
  }
}
