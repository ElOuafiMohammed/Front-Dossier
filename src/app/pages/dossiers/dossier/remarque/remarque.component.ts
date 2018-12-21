import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { GenericVariablesSearch } from 'app/shared/generic.variables';
import { minSearchLength } from 'app/shared/methodes-generiques';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { AccueilService } from '../../accueil/accueil.service';
import { ResponsableTechnique } from '../../create-dossier/create-dossier.interface';
import { DossierService } from '../../dossiers.service';
import { Remarque } from './remarque.interface';
import { ReponseComponent } from './reponse/reponse.component';
import { Reponse } from './reponse/reponse.interface';


@Component({
  selector: 'siga-remarque',
  templateUrl: './remarque.component.html',
  styleUrls: ['./remarque.component.scss']
})
export class RemarqueComponent extends GenericVariablesSearch implements OnInit {
  @ViewChild('remarqueParent', { read: ViewContainerRef }) container: ViewContainerRef;
  @Output() remarqueDataEvent = new EventEmitter<Remarque>();
  @Output() remarqueFromBDEvent = new EventEmitter<Remarque>();
  @Output() remarqueDataDeletedFrontEvent = new EventEmitter<Remarque>();
  reponseComponent: ComponentRef<ReponseComponent>;
  idInstance = 0;
  idBack = null;
  _ref: any;
  nomInspecteur = '';
  loginEmetteur
  focus = false;
  loginEmetteurConnected = '';
  remarque = '';
  // US 530
  etats = [];
  etat = EtatRemarque['A'];
  remarkHasResponse = false;
  disableButtonSupr = false
  remakDisabled = false;
  reponse: Reponse;
  subsciption: Subscription;

  // US 3499
  recipients: ResponsableTechnique[];
  recipient: ResponsableTechnique = null;
  recipientIsRequired = false;
  dateDuJourAffiche = moment().locale('fr').format('DD/MM/YYYY HH:mm');
  dateDuJOurRetourne = moment().utc().format();
  listRemarques: Remarque[] = [];
  courantPhase = '';
  remarqueControl: FormControl = new FormControl(this.remarque);
  dateDujourControl: FormControl = new FormControl(this.dateDuJourAffiche);
  nomPrenomControl: FormControl = new FormControl(this.nomInspecteur);
  recipientControl: FormControl = new FormControl(this.recipient)
  filteredResponsablesTech: Observable<any[]>;

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;



  constructor(private _cfr: ComponentFactoryResolver, private _accueilService: AccueilService,
    private _dossierService: DossierService) { super() }

  ngOnInit() {
    this.nomPrenomControl.disable();
    this.dateDujourControl.disable();
    const keys = Object.keys(EtatRemarque);
    this.etats = keys.map(key => EtatRemarque[key as any]);
    if (this._accueilService) {
      this._accueilService.getUtilisateurConnecte().subscribe(value => {
        this.loginEmetteurConnected = value.login;
        if (this.loginEmetteur && this.loginEmetteurConnected !== this.loginEmetteur) {
          this.remarqueControl.disable();
          this.remakDisabled = true;
          this.disableButtonSupr = true
        } else if (this.remarkHasResponse) {
          this.remarqueControl.disable();
          this.remakDisabled = true;
        } else {
          this.disableButtonSupr = false;
          this.remakDisabled = false;
          this.remarqueControl.enable();
        }
      });
    }

    if (this.recipientControl) {
      this.recipientControl.valueChanges.subscribe((userDest: ResponsableTechnique) => {

        if (userDest && !this.recipientControl.errors) {
          this.recipientIsRequired = false;
        } else {
          this.recipientIsRequired = true;
        }
        this.createRemarque();
      })
    }
    // US 3499 Add destinataire

    if (this._dossierService) {
      this._dossierService.getResponsableTech()
        .subscribe(recip => {
          this.recipients = recip;
          if (this.recipients) {
            this.filteredResponsablesTech = GeneriqueListValeur.filtringList(this.recipients, this.recipientControl, this.respTechValidatorKey, minSearchLength, 'responsableTech');
          }
        });

    }
  }
  deleteRemarque() {
    const remarqueData: Remarque = {
      id: this.idBack,
      idFront: this.idInstance,
      remarque: this.remarqueControl.value,
      dateRemarque: this.dateDuJOurRetourne,
      nomPrenomEmetteur: this.nomPrenomControl.value,
      loginEmetteur: '',
      loginDestinataire: this.recipientControl.value,
      deleted: true,
      etat: this.etat
    }

    this._ref.destroy();
    if (remarqueData.id) {
      this.remarqueFromBDEvent.emit(remarqueData); // SUppr back
    } else {
      this.remarqueDataDeletedFrontEvent.emit(remarqueData); // supr Front
    }
  }
  onBlurRemarque() {
    if (!this.remarqueControl.pristine) {
      this.remarkHasResponse = false;
      if (this.recipientControl.value) {
        this.recipientIsRequired = false
      } else {
        this.recipientIsRequired = true
      }
      this.createRemarque();
    }
  }

  initConnectedUser() {
    this._accueilService.getUtilisateurConnecte().subscribe(value => {
      this.nomInspecteur = `${value.prenom} ${value.login}`;
      this.loginEmetteur = value.login;
    })
  }

  // US 530 : Add Response
  addResponse() {
    // check and resolve the component
    const comp = this._cfr.resolveComponentFactory(ReponseComponent);
    // Create component inside container
    this.reponseComponent = this.container.createComponent(comp);
    this.reponseComponent.instance._ref = this.reponseComponent;
    this.reponseComponent.instance.initConnectedUser();
    this.reponseComponent.instance.reponseDataEvent.subscribe((value: Reponse) => {
      if (value.reponse) {
        this.remarkHasResponse = true;
        this.remarqueControl.disable();
        this.remakDisabled = true;
        this.reponse = value;
      } else {
        this.remarkHasResponse = false;
        this.enableRemarque();
      }
      this.createRemarque();
    });
    this.reponseComponent.instance.reponseDataFrontDeletedEvent.subscribe((value: boolean) => {
      if (value) {
        this.remarkHasResponse = false;
      }
      if (value && !this.disableButtonSupr) {
        this.enableRemarque();
      }
    })
  }

  enableRemarque() {
    this.remarqueControl.enable();
    this.reponse = null;
    this.remakDisabled = false
    this.createRemarque();
  }
  // If state is updated
  change(selected: any) {
    this.createRemarque()
  }
  diplayResponse(reponse: Reponse) {
    this.reponse = reponse;
    const comp = this._cfr.resolveComponentFactory(ReponseComponent);
    // Create component inside container
    this.reponseComponent = this.container.createComponent(comp);
    this.reponseComponent.instance._ref = this.reponseComponent;
    this.reponseComponent.instance.reponse = reponse.reponse;
    this.reponseComponent.instance.dateDuJourAffiche = moment(reponse.dateReponse).locale('fr').format('DD/MM/YYYY HH:mm');
    this.reponseComponent.instance.nomInspecteur = reponse.nomPrenomReponseDe;
    this.reponseComponent.instance.loginReponseDe = reponse.loginReponseDe;
    this.remarkHasResponse = true;
    this.remarqueControl.disable();
    this.remakDisabled = true;
    this.reponseComponent.instance.reponseFromBDEvent.subscribe((updatedResponse: Reponse) => {
      if (!updatedResponse) {
        this.remarkHasResponse = false;
        if (!this.disableButtonSupr) {
          this.remarqueControl.enable();
          this.remakDisabled = false
        } else {
          this.remarqueControl.disable();
          this.remakDisabled = true
        }
      }
      this.reponse = updatedResponse;
      this.createRemarque();
    });
  }

  createRemarque() {
    const remarqueData: Remarque = {
      id: this.idBack,
      idFront: this.idInstance,
      remarque: this.remarqueControl && this.remarqueControl.value ? this.remarqueControl.value : null,
      dateRemarque: this.dateDuJOurRetourne,
      nomPrenomEmetteur: this.nomPrenomControl.value,
      loginEmetteur: this.loginEmetteur,
      deleted: false,
      hasError: this.recipientIsRequired,
      etat: this.getKey(this.etat),
      reponse: this.reponse ? this.reponse.reponse : null,
      dateReponse: this.reponse ? this.reponse.dateReponse : null,
      loginReponseDe: this.reponse ? this.reponse.loginReponseDe : null,
      nomPrenomReponseDe: this.reponse ? this.reponse.nomPrenomReponseDe : null,
      //US 3499 add Recipient
      loginDestinataire: this.recipientControl && this.recipientControl.value ? this.recipientControl.value.login : null,
      lu: false,
      archive: false,

    }
    // if remarque has not value  is null don't send the remark to back
    if (remarqueData && remarqueData.remarque) {
      this.remarqueFromBDEvent.emit(remarqueData);
      this.remarqueDataEvent.emit(remarqueData);
    }

  }

  getKey(value: string): string {
    let key = ''
    switch (value) {
      case 'A traiter': {
        key = 'A';
        break;
      }
      case 'Traité': {
        key = 'T';
        break;
      }
      case 'En cours': {
        key = 'E';
        break;
      }
      case 'Refusé': {
        key = 'R';
        break;
      }
      default: {
        key = '';
        break;
      }
    }
    return key;
  }

  //US 3499 add Recipient
  displayRecipient(user: ResponsableTechnique): string | undefined {
    if (user) {
      return `${user.prenom}  ${user.nom}`;
    }
  }

  removeRecipient() {
    if (this.recipientControl) {
      this.recipientControl.setValue(null);
      this.createRemarque();
    }

  }


}

// US 530
export enum EtatRemarque {
  'A' = 'A traiter',
  'T' = 'Traité',
  'E' = 'En cours',
  'R' = 'Refusé'
}





