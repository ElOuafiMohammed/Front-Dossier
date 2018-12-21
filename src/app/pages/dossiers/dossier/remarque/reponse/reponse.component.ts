import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

import { AccueilService } from '../../../accueil/accueil.service';
import { Reponse } from './reponse.interface';


@Component({
  selector: 'siga-reponse',
  templateUrl: './reponse.component.html',
  styleUrls: ['./reponse.component.scss']
})
export class ReponseComponent implements OnInit, OnDestroy {
  @Output() reponseDataEvent = new EventEmitter<Reponse>();
  @Output() reponseFromBDEvent = new EventEmitter<Reponse>();
  @Output() reponseDataFrontDeletedEvent = new EventEmitter<boolean>();
  _ref: any;
  nomInspecteur = '';
  reponse = '';
  dateDuJourAffiche = moment().locale('fr').format('DD/MM/YYYY HH:mm');
  loginReponseDe = '';
  loginReponseDeTMp = '';
  disableButtonSupr = false;
  responseDisabled = false;
  reponseControl: FormControl = new FormControl(this.reponse);
  dateDujourControl: FormControl = new FormControl(this.dateDuJourAffiche);
  nomPrenomControl: FormControl = new FormControl(this.nomInspecteur);
  subsciption: Subscription
  constructor(private _accueilService: AccueilService) { }

  ngOnInit() {
    this.dateDujourControl.disable();
    this.nomPrenomControl.disable();
    if (this._accueilService) {
      this.subsciption = this._accueilService.getUtilisateurConnecte().subscribe(value => {
        this.loginReponseDeTMp = value.login;
        if (this.loginReponseDe && this.loginReponseDe !== this.loginReponseDeTMp) {
          this.disableResponse();

        } else {
          this.enableResponse();
        }
      });
    }
  }

  disableResponse() {
    this.reponseControl.disable();
    this.disableButtonSupr = true;
    this.responseDisabled = true;
  }
  enableResponse() {
    this.reponseControl.enable();
    this.disableButtonSupr = false;
    this.responseDisabled = false;
  }

  initConnectedUser() {
    this.subsciption = this._accueilService.getUtilisateurConnecte().subscribe(value => {
      this.loginReponseDe = value.login;
      this.nomPrenomControl.setValue(`${value.prenom} ${value.nom}`);
    }
    )
  }

  onBlurResponse() {
    if (!this.reponseControl.pristine) {
      const reponseData: Reponse = {
        reponse: this.reponseControl.value,
        dateReponse: moment().locale('fr').format(),
        nomPrenomReponseDe: this.nomPrenomControl.value,
        loginReponseDe: this.loginReponseDe,
        deleted: false
      }
      this.reponseFromBDEvent.emit(reponseData);
      this.reponseDataEvent.emit(reponseData);
    }

  }

  deleteResponse() {
    this._ref.destroy();
    this.reponseFromBDEvent.emit(null);
    this.reponseDataFrontDeletedEvent.emit(true);
  }

  ngOnDestroy() {
    if (this.subsciption) {
      this.subsciption.unsubscribe();
    }
  }

}





