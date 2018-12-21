import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Departements } from 'app/pages/dossiers/dossiers.interface';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import MethodeGenerique, { minSearchLength, verifierLocalisationPertinenteErreur } from 'app/shared/methodes-generiques';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { differenceBy } from 'lodash';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { ComponentViewRightMode, DossierService } from '../../../../dossiers.service';
import { Communes, Operation } from '../../../dossier.interface';


@Component({
  selector: 'siga-app-departements',
  templateUrl: './departements.component.html',
  styleUrls: ['./departements.component.scss']
})
export class DepartementsComponent extends ComponentViewRightMode implements OnInit, OnChanges {

  /**
   *  get reference of input departement
   */
  @ViewChild('input') departementsInput: any;

  /**
   *  input event of current operation
   */
  @Input() currentOperation: Operation;

  /**
   * input event of viewRight
   */
  @Input() viewRight: boolean = null;

  /**
   *  Emet un événement de la liste des départements au parent
   */
  @Output() departementsOutput: EventEmitter<Departements[]> = new EventEmitter();

  /**
   *  Emet un événement de la liste des communes au parents
   */
  @Output() communesOutput: EventEmitter<Communes[]> = new EventEmitter();

  /**
   * Emet un évenement d'erreur(true/false) au parent
   */
  @Output() erreurEventDepartement: EventEmitter<any> = new EventEmitter();

  /**
   * Output Event en mode édition
   */
  @Output() eventDepartementEditMode: EventEmitter<any> = new EventEmitter();

  localisationPertinente = false;

  /**
   * Liste de tout les départements, récupérés par le back
   */
  listDepartements: Departements[] = [];

  /**
   * Liste des départements affiché dans la liste déroulante.
   * Lorsqu'un département à été sélectionné, il est alors retiré de cette liste
   */
  listDepartementsReduce: Departements[] = [];

  /**
   * Liste des départements affiché dans la liste déroulante en observable
   */
  listDepartementsObservable: Observable<Departements[]>;

  /**
   * Liste des départements sélectionnés
   */
  selectedDepartements: Departements[] = [];

  isHidden: boolean;

  formDepartements = new FormGroup({
    departements: new FormControl(),
  });


  readonly departementsValidatorKey = 'departementsNotFound';

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  get departementsControl() { return this.formDepartements.get('departements') };

  constructor(public dossierService: DossierService, public translate: TranslateService) {
    super(dossierService)
  }

  /**
   * Initialise la liste déroulante de départements
   */
  ngOnInit() {
    this.isHidden = false;

    // Si la liste des département est vide
    if (!this.currentOperation.departements) {
      this.currentOperation.departements = [];
    }

    // Recuperation des département depuis le backend
    this.dossierService.getDepartements().subscribe((departement) => {
      this.listDepartements = departement;
      // Filtre la liste déroulante pour enlever les départements récupérés
      this.listDepartementsReduce = differenceBy(this.listDepartements, this.currentOperation.departements, 'numero');

      // Set synchronous validator once the data is available
      this.departementsControl.setValidators([
        GeneriqueListValeur.sigaAutocompleteValidatorFactory(this.listDepartementsReduce, this.departementsValidatorKey)
      ]);

      // Permet de trier la liste de départements par numero
      this.listDepartementsReduce.sort(MethodeGenerique.sortingDepartement);

      // Met a jour la liste déroulante
      this.updateListDepartementsObservable();
    });

    // Recherche d'erreur de saisie
    this.departementsControl.valueChanges.subscribe(valeur => {
      this.currentOperation.departementError = this.departementsControl.hasError('departementsNotFound');
      if (this.departementsControl.hasError('departementsNotFound')) {
        this.currentOperation.inputDepartementErreur = this.departementsControl.value;
      } else { this.currentOperation.inputDepartementErreur = null; }
    });

  }

  /**
   * Verifie à chaque changement la phase du dossier
   */
  ngOnChanges() {
    // Si il est en phase T40 Refuser
    if (this.dossierService.dossier.phase === 'T40') {
      // Supprime les élements ajoutés non enregistrés
      this.selectedDepartements = []

      // Récupere la liste entiere de département et update
      this.listDepartementsReduce = this.listDepartements
      this.updateListDepartementsObservable()
      // Sinon
    } else {

      // Récupère les données du back, si elles sont vides
      if (!this.currentOperation.departements) {
        // Récupère les départements
        this.currentOperation.departements = [];
      }
    }
    // Si le formulaire est instancié
    if (this.formDepartements) {
      // S'il y a une erreur de saisie d'un département
      if (this.currentOperation.inputDepartementErreur) {
        this.isHidden = true;
        this.departementsControl.setValue(this.currentOperation.inputDepartementErreur);
      } else {
        this.departementsControl.patchValue(null);
        if (this.currentOperation.departements.length > 0) {
          this.isHidden = false;
        }
      }
      this.updateListDepartementsObservable();
    }
    this.listDepartementsReduce = differenceBy(this.listDepartements, this.currentOperation.departements, 'numero');
    this.updateListDepartementsObservable();
  }


  /**
   * Permet d'enregistrer dans le tableau 'selectedDepartements' les departements sélectionnés dans la liste déroulante
   * @param event
   */
  onDepartementSelect(event: Departements) {
    // Supression de la valeur sélectionnée dans l'input
    this.departementsControl.patchValue(null);

    // Ajout dans la liste le département sélectionné et le communique a Dossier
    this.currentOperation.departements.push(event);
    // Supression de la valeur sélectionnée dans la liste déroulante de departements
    const indexToDelete = this.listDepartementsReduce.indexOf(event)

    this.listDepartementsReduce.splice(indexToDelete, 1)

    // Permet de trier la liste de départements par numero
    this.listDepartementsReduce.sort(MethodeGenerique.sortingDepartement);

    // Met a jour la liste déroulante
    this.updateListDepartementsObservable()

    // Activation edit mode
    this.eventDepartementEditMode.emit({ type: 'departement', value: true });
    if (this.currentOperation.communes.length === 0 && this.currentOperation.lignesMasseEau.length === 0 && this.currentOperation.bvGestionNatureOperations.length === 0) {
      if (this.currentOperation.departements.length === 0 && this.currentOperation.regions.length === 0) {
        this.currentOperation.localisationPertinenteError = true;
      }
    } else { this.currentOperation.localisationPertinenteError = false; }
  }


  /**
   * Permet de supprimer l'étiquette correspondante à un département sélectionné
   * @param event département à supprimer
   */
  onDeleteDepartement(event: Departements) {
    // Rajoute à la liste déroulante le département supprimé et la trie
    this.listDepartementsReduce.push(event);
    this.listDepartementsReduce.sort(MethodeGenerique.sortingDepartement);

    // Supprime le département de la liste de départements sélectionnés (etiquettes) et de dossier
    const indexToDelete = this.currentOperation.departements.indexOf(event);
    this.currentOperation.departements.splice(indexToDelete, 1);

    // Met a jour la liste déroulante
    this.updateListDepartementsObservable()

    // Activation edit mode
    this.eventDepartementEditMode.emit({ type: 'departement', value: true });
    if (verifierLocalisationPertinenteErreur(this.currentOperation)) {
      this.currentOperation.localisationPertinenteError = true;
    } else { this.currentOperation.localisationPertinenteError = false; }
  }

  /**
   * Met à jour la liste de départements observable
   * Permet l'affichage dans la liste déroulante et la recherche de départements en écrivant dans l'input
   */
  updateListDepartementsObservable(): void {
    this.listDepartementsObservable = this.departementsControl.valueChanges
      .pipe(
        startWith(''),
        map(value => (value && this.departementsControl.hasError(this.departementsValidatorKey)) ?
          this.filterDepartements(value, this.listDepartementsReduce, minSearchLength) : this.listDepartementsReduce.slice()
        )
      )
  }


  /**
   * Permet de filtrer la liste de départements après que l'utilisateur a effectué une recherche
   * @param userInput valeur de la recherche de l'utilisateur
   * @param listValues liste des départements à filtrer
   * @param searchLength nombre de charactères minimum pour commencer à filtrer
   */
  filterDepartements(userInput: string, listValues: any[], searchLength: number): Departements[] {
    return listValues.filter(departement => {
      let result = false;
      if (userInput.length < searchLength) {
        return (departement.numero.toLowerCase().search(userInput.toString().toLowerCase()) === 0)
      }
      departement.nomDept.toLowerCase().split(' ').forEach(word => {
        if (word.search(userInput.toString().toLowerCase()) === 0) {
          result = true;
        }
      });
      return (departement.numero.toLowerCase().search(userInput.toString().toLowerCase()) === 0) || result;
    });
  }

  /**
   * Permet de déselectionner l'input après avoir choisi un département
   *     Pour le réactiver ajouter "; blurInput()" à <mat-autocomplete (optionSelected)="..."
   */
  blurInput() {
    this.departementsInput.nativeElement.blur();
  }

  /**
   * Manages how a departement should be displayed in the input
   * @param departement a given Departement to be formatted
   */
  displayDepartements(departement: any) {
    if (departement && departement.numero) {
      return `${departement.numero} - ${departement.nomDept}`;
    }
    return departement;
  }



  /**
   *Event focus
   */
  onFocus() {
    this.isHidden = true;
  }

  /**
   * Event Blur
   */
  onBlur() {
    if (!this.departementsControl.value) {
      this.isHidden = false;
    }
    this.departementsInput.nativeElement.blur();

    this.currentOperation.departementError ? this.erreurEventDepartement.emit({ type: 'departement', value: true }) :
      this.erreurEventDepartement.emit({ type: 'departement', value: false });
    if (!this.departementsControl.value && verifierLocalisationPertinenteErreur(this.currentOperation)) {
      this.currentOperation.localisationPertinenteError = true;
    }
  }

  /**
   * Foncction d'évenement d'erreur pour les communes
   * @param event
   */
  onErreurEventCommune(event: boolean) {
    this.erreurEventDepartement.emit({ type: 'commune', valvue: event });
  }

  /**
   * Fonction d'événement pour activer le mode édition pour les communes
   * @param event
   */
  onEventCommuneEditMode(event: boolean) {
    this.eventDepartementEditMode.emit({ type: 'commune', value: event });
  }
  onInput(event) {
    this.currentOperation.localisationPertinenteError = false;
  }

}
