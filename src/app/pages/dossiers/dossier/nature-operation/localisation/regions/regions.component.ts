import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { minSearchLength, verifierLocalisationPertinenteErreur } from 'app/shared/methodes-generiques';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { differenceBy } from 'lodash';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { ComponentViewRightMode, DossierService } from '../../../../dossiers.service';
import { Operation, Regions } from '../../../dossier.interface';

@Component({
  selector: 'siga-app-regions',
  templateUrl: './regions.component.html',
  styleUrls: ['./regions.component.scss']
})
export class RegionsComponent extends ComponentViewRightMode implements OnInit, OnChanges {

  /**
   *  récupére la référence de l'input region
   */
  @ViewChild('input') regionsInput: any;

  /**
   *  récupére l'operation courante
   */
  @Input() currentOperation: Operation;

  /**
   *  regionsOutput est un événement permettant d'envoyer  la liste des regions au parent
   */
  @Output() regionsOutput: EventEmitter<Regions[]> = new EventEmitter();

  /**
   * erreurEventRegion est un événement permettant d'envoyer  l'erreur(true/false) au parent
   */
  @Output() erreurEventRegion: EventEmitter<any> = new EventEmitter();

  /**
   * eventRegionEditMode est un événement permettant d'envoyer l'etat  d'édition du champs région au parent
   */
  @Output() eventRegionEditMode: EventEmitter<any> = new EventEmitter();

  /**
   * regionIsSelected est un événement permettant de savoir s'il y a des régions séléctionner ou non.
   */
  @Output() regionsIsSelected: EventEmitter<boolean> = new EventEmitter();

  /**
   * Liste de tout les régions, récupérés par le back
   */
  listRegions: Regions[] = [];

  /**
   * Liste des régions affiché dans la liste déroulante en observable
   */
  listRegionsObservable: Observable<Regions[]>;

  /**
   * Liste des régions affiché dans la liste déroulante.
   * Lorsqu'un région à été sélectionné, il est alors retiré de cette liste
   */
  listRegionsReduce: Regions[] = [];

  /**
   * Liste des régions sélectionnées
   */
  selectedRegions: Regions[] = [];

  /**
   * Variable permettant de cacher un champs
   */
  isHidden: boolean;

  /**
   * Formulaire de la région
   */
  formRegions = new FormGroup({
    regions: new FormControl(),
  });

  /**
   * Variable pour la lecture seule
   */
  readonly regionsValidatorKey = 'regionsNotFound';

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  /**
   * Retourne le contrôleur du formulaire de région
   */
  get regionsControl() { return this.formRegions.get('regions') };

  /**
   * Le constructeur du composant
   * @param dossierService: variable gérant les services du dossiers
   */
  constructor(
    public dossierService: DossierService
  ) {
    super(dossierService)
  }

  /**
   * Initialisation du composant région
   */
  ngOnInit() {
    this.isHidden = false;

    // Si la liste des regions est vide
    if (!this.currentOperation.regions) {
      this.currentOperation.regions = [];
    }

    // Récuperation de la liste des régions depuis le backend
    this.dossierService.getRegions().subscribe((region) => {
      // Récupère la liste complète
      this.listRegions = region;

      // Filtre la liste déroulante pour enlever les regions déjà enregistrée
      this.listRegionsReduce = differenceBy(this.listRegions, this.currentOperation.regions, 'numero');

      // Envoie du validator synchrone une fois que les données sont disponibles
      this.regionsControl.setValidators([
        GeneriqueListValeur.sigaAutocompleteValidatorFactory(this.listRegionsReduce, this.regionsValidatorKey)
      ]);

      // Permet de trier la liste de regions par numéro
      this.listRegionsReduce.sort(this.sortingRegions);

      // Met à jour la liste déroulante
      this.updateListRegionsObservable();
    });

    // Recherche d'erreur de saisie
    this.regionsControl.valueChanges.subscribe(valeur => {
      this.currentOperation.regionError = this.regionsControl.hasError('regionsNotFound');
      if (this.regionsControl.hasError('regionsNotFound')) {
        this.currentOperation.inputRegionErreur = this.regionsControl.value;
      } else { this.currentOperation.inputRegionErreur = null; }
    });
  }

  ngOnChanges() {
    // Récupère les données du back, si elles sont vides
    if (!this.currentOperation.regions) {
      // Initialise les régions
      this.currentOperation.regions = [];
    }
    // Si le formulaire est instancié
    if (this.formRegions) {
      // S'il y a une erreur de saisie d'une région
      if (this.currentOperation.inputRegionErreur) {
        this.isHidden = true;
        this.regionsControl.setValue(this.currentOperation.inputRegionErreur);
      } else {
        this.regionsControl.patchValue(null);
        if (this.currentOperation.regions.length > 0) {
          this.isHidden = false;
        }
      }
      this.updateListRegionsObservable();
    }
    this.listRegionsReduce = differenceBy(this.listRegions, this.currentOperation.regions, 'numero');
    this.updateListRegionsObservable();
  }

  /**
   * Permet d'enregistrer dans le tableau 'selectedRegions' les régions sélectionnées dans la liste déroulante
   * @param event: région selectionnée
   */
  onRegionSelect(event: Regions) {
    // Supression de la valeur sélectionnée dans l'input
    this.regionsControl.patchValue(null);

    // Ajout dans la liste les régions sélectionnées et le communique à Dossier
    this.currentOperation.regions.push(event);
    // Supression de la valeur sélectionnée dans la liste déroulante de regions
    const indexToDelete = this.listRegionsReduce.indexOf(event)
    this.listRegionsReduce.splice(indexToDelete, 1)

    // Permet de trier la liste de régions par numéro
    this.listRegionsReduce.sort(this.sortingRegions);

    // Met à jour la liste déroulante
    this.updateListRegionsObservable()

    // Activation edit mode
    this.eventRegionEditMode.emit({ type: 'region', value: true });

    //
    if (this.currentOperation.communes.length === 0 && this.currentOperation.lignesMasseEau.length === 0 && this.currentOperation.bvGestionNatureOperations.length === 0) {
      if (this.currentOperation.departements.length === 0 && this.currentOperation.regions.length === 0) {
        this.currentOperation.localisationPertinenteError = true;
      }
    } else { this.currentOperation.localisationPertinenteError = false; }
  }


  /**
   * Permet de supprimer l'étiquette correspondante à une région sélectionnée
   * @param event: région à supprimer
   */
  onDeleteRegion(event: Regions) {
    // Rajoute à la liste déroulante la région supprimée et le trie
    this.listRegionsReduce.push(event);
    this.listRegionsReduce.sort(this.sortingRegions);

    // Supprime la région de la liste de régions sélectionnées (etiquettes) et de dossier
    const indexToDelete = this.currentOperation.regions.indexOf(event);
    this.currentOperation.regions.splice(indexToDelete, 1);

    // Met à jour la liste déroulante
    this.updateListRegionsObservable()

    // Activation edit mode
    this.eventRegionEditMode.emit({ type: 'region', value: true });

    if (verifierLocalisationPertinenteErreur(this.currentOperation)) {
      this.currentOperation.localisationPertinenteError = true;
    } else { this.currentOperation.localisationPertinenteError = false; }

  }

  /**
   * Met à jour la liste de régions observables
   * Permet l'affichage dans la liste déroulante et la recherche de régions en écrivant dans l'input
   */
  updateListRegionsObservable(): void {
    this.listRegionsObservable = this.regionsControl.valueChanges
      .pipe(
        startWith(''),
        map(value => (value && this.regionsControl.hasError(this.regionsValidatorKey)) ?
          this.filterRegions(value, this.listRegionsReduce, minSearchLength) : this.listRegionsReduce.slice()
        )
      )
  }

  /**
   * Permet de filtrer la liste de régions après que l'utilisateur ait effectué une recherche
   * @param userInput: valeur de la recherche de l'utilisateur
   * @param listValues: liste des régions à filtrer
   * @param searchLength: nombre de caractères minimums pour commencer à filtrer
   */
  filterRegions(userInput: string, listValues: any[], searchLength: number): Regions[] {
    return listValues.filter(region => {
      let result = false;
      if (userInput.length < searchLength) {
        return (region.numero.toLowerCase().search(userInput.toString().toLowerCase()) === 0)
      }
      region.nomRegion.toLowerCase().split(' ').forEach(word => {
        if (word.search(userInput.toString().toLowerCase()) === 0) {
          result = true;
        }
      });
      return (region.numero.toLowerCase().search(userInput.toString().toLowerCase()) === 0) || result;
    });
  }

  /**
   * Fonction de comparaison de régions par numéro
   * @param a Région
   * @param b Region suivant
   */
  sortingRegions(a: Regions, b: Regions): number {
    if (a.numero < b.numero) {
      return -1;
    }
    if (a.numero > b.numero) {
      return 1
    }
    return 0;
  }

  /**
   * Gère la manière dont une région devrait être affichée dans l'entrée
   * @param region: région à formater
   */
  displayRegions(region: any) {
    if (region && region.numero) {
      return `${region.numero} - ${region.nomRegion}`;
    }
    return region;
  }

  /**
   *L'événement Focus
   */
  onFocus() {
    this.isHidden = true;
  }

  /**
   * L'événement Blur
   */
  onBlur() {
    if (!this.regionsControl.value) {
      this.isHidden = false;
    }
    this.regionsInput.nativeElement.blur();

    this.currentOperation.regionError ? this.erreurEventRegion.emit({ type: 'region', value: true }) :
      this.erreurEventRegion.emit({ type: 'region', value: false });

    if (!this.regionsControl.value && verifierLocalisationPertinenteErreur(this.currentOperation)) {
      this.currentOperation.localisationPertinenteError = true;
    }
  }

  onInput(event) {
    this.currentOperation.localisationPertinenteError = false;
  }
}

