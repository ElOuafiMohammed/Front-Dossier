import {
  AfterViewChecked,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ResponsableTechnique } from 'app/pages/dossiers/create-dossier/create-dossier.interface';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

import { DossierService } from '../../../dossiers.service';
import { EtatRemarque, RemarqueComponent } from '../remarque.component';
import { Remarque } from '../remarque.interface';
import { Reponse } from '../reponse/reponse.interface';

@Component({
  selector: "siga-list-remarques",
  templateUrl: "./list-remarques.component.html",
  styleUrls: ["./list-remarques.component.scss"]
})
export class ListRemarquesComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild("parent", { read: ViewContainerRef }) container: ViewContainerRef;
  @Output() remarques = new EventEmitter<Remarque[]>();

  @Input() remarqueClicked = true;
  remarqueComponent: ComponentRef<RemarqueComponent>;
  listRemarques: Array<Remarque> = [];
  listCourentRemarques: any = [];
  id = 0;
  courantPhase = "";
  users: ResponsableTechnique[];
  subsciption: Subscription;
  constructor(
    private _cfr: ComponentFactoryResolver,
    private _dossierService: DossierService
  ) { }

  ngOnInit() {
    this.subsciption = this._dossierService.dossier$.subscribe(dossierReady => {
      if (this._dossierService.dossier) {
        this.courantPhase = this._dossierService.dossier.phase;
        if (
          this._dossierService.dossier.dossierCorrespondance &&
          this._dossierService.dossier.dossierCorrespondance.remarques
        ) {
          this.listRemarques = this._dossierService.dossier.dossierCorrespondance.remarques;
          if (this.listCourentRemarques.length !== 0) {
            this.listCourentRemarques.forEach(element => {
              element.destroy();
            });
          }
          this.updateFormRemarque(
            this._dossierService.dossier.dossierCorrespondance.remarques
          );
        }

      }
    });
    document.getElementById("button").focus();
  }

  ngAfterViewChecked() {
    if (
      this.remarqueComponent &&
      this.remarqueComponent.instance.remarqueDataDeletedFrontEvent
    ) {
      this.remarqueComponent.instance.remarqueDataDeletedFrontEvent.subscribe(
        value => {
          if (value.deleted) {
            this.listRemarques = this.filterList(this.listRemarques, value);
          }
          this.remarques.emit(this.listRemarques);
        }
      );
    }
  }

  updateFormRemarque(listRemarque: Remarque[]) {
    for (const remarque of listRemarque) {
      if (remarque.remarque) {
        this.displayRemarque(remarque);
      }
    }
  }

  displayRemarque(remarque: Remarque) {
    // check and resolve the component
    const comp = this._cfr.resolveComponentFactory(RemarqueComponent);
    // Create component inside container
    this.remarqueComponent = this.container.createComponent(comp);

    this.remarqueComponent.instance._ref = this.remarqueComponent;
    this.remarqueComponent.instance.remarque = remarque.remarque;
    this.remarqueComponent.instance.nomInspecteur = remarque.nomPrenomEmetteur;
    this.remarqueComponent.instance.loginEmetteur = remarque.loginEmetteur;
    this.remarqueComponent.instance.courantPhase = this.courantPhase;
    // this.remarqueComponent.instance.nomInspecteur = 'PATRICIA POULAIN-BEAUDELIN';
    this.remarqueComponent.instance.dateDuJourAffiche = moment(
      remarque.dateRemarque
    )
      .locale("fr")
      .format("DD/MM/YYYY HH:mm");
    this.remarqueComponent.instance.idBack = remarque.id;
    this.remarqueComponent.instance.listRemarques = this.listRemarques;
    this.remarqueComponent.instance.etat = EtatRemarque[remarque.etat];
    this.remarqueComponent.instance.recipient = remarque.destinataire;
    this.remarqueComponent.instance.recipientControl.setValue(remarque.destinataire)
    // US 530 we recreate composant to display response if remark has an response
    if (remarque.reponse) {
      this.prepareResponseOfRemark(remarque);
    }
    // With to destroy all remarque befor displaying
    this.listCourentRemarques.push(this.remarqueComponent.instance._ref);
    this.remarqueComponent.instance.remarqueFromBDEvent.subscribe((value: Remarque) => {
      // while remarque value in not update date of remark is not changed
      if (JSON.stringify(value.remarque) === JSON.stringify(remarque.remarque)) {
        value.dateRemarque = remarque.dateRemarque
      }
      if (value.id) {
        this.listRemarques = this.filterList(this.listRemarques, value);
      }
      if (!value.deleted && value.remarque !== null) {

        this.listRemarques.push(value);
      }
      this.remarques.emit(this.listRemarques);
    })
  }

  addRemarque() {
    // check and resolve the component
    const comp = this._cfr.resolveComponentFactory(RemarqueComponent);
    // Create component inside container
    this.remarqueComponent = this.container.createComponent(comp);
    this.remarqueComponent.instance._ref = this.remarqueComponent;
    this.remarqueComponent.instance.idInstance = this.id;
    this.remarqueComponent.instance.listRemarques = this.listRemarques;
    this.remarqueComponent.instance.dateDuJourAffiche = moment()
      .locale("fr")
      .format("DD/MM/YYYY HH:mm");
    this.remarqueComponent.instance.initConnectedUser();
    this.remarqueComponent.instance.remarkHasResponse = false;
    this.remarqueComponent.instance.recipientIsRequired = false;
    // With to destroy all remarque befor displaying
    this.listCourentRemarques.push(this.remarqueComponent.instance._ref);
    // Send the row to dossier
    this.remarqueComponent.instance.remarqueDataEvent.subscribe((value: Remarque) => {
      if (JSON.stringify(value.remarque) === JSON.stringify(this.remarqueComponent.instance.remarque)) {
        value.dateRemarque = this.remarqueComponent.instance.dateDuJOurRetourne;
      }
      this.listRemarques = this.filterList(this.listRemarques, value);
      this.listRemarques.push(value);

      this.remarques.emit(this.listRemarques);
    }
    );
    this.id++;
  }

  filterList(remarques: Remarque[], remarqueParam: Remarque): Remarque[] {

    let resultats: Remarque[] = [];
    if (remarqueParam.id) {
      resultats = remarques.filter(remarque => remarque.id !== remarqueParam.id)
    } else {
      resultats = remarques.filter(remarque => (remarque.id || remarque.idFront !== remarqueParam.idFront))
    }
    return resultats;
  }



  // US 530
  prepareResponseOfRemark(remarque: Remarque) {
    const reponse: Reponse = {
      loginReponseDe: remarque.loginReponseDe,
      nomPrenomReponseDe: remarque.nomPrenomReponseDe,
      reponse: remarque.reponse,
      dateReponse: remarque.dateReponse
    };
    this.remarqueComponent.instance.diplayResponse(reponse);
  }

  ngOnDestroy() {
    if (this.subsciption) {
      this.subsciption.unsubscribe();
    }
  }
}
