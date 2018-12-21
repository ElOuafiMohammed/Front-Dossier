import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { minSearchLength, verifierLocalisationPertinenteErreur } from 'app/shared/methodes-generiques';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { differenceBy } from 'lodash';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { ComponentViewRightMode, DossierService } from '../../../../dossiers.service';
import { BvGestion, Operation } from '../../../dossier.interface';

@Component({
  selector: 'siga-bv-gestion',
  templateUrl: './bv-gestion.component.html',
  styleUrls: ['./bv-gestion.component.scss']
})
export class BvGestionComponent extends ComponentViewRightMode implements OnInit, OnChanges {

  @ViewChild('input') bgGestionInput: any;
  /**
   * La nature d'opération courante
   */
  @Input() currentOperation: Operation;

  /**
   * Output Event erreur
   */
  @Output() erreurEventBv: EventEmitter<boolean> = new EventEmitter();

  /**
   * Output Event erreur
   */
  @Output() eventBvEditMode: EventEmitter<boolean> = new EventEmitter();

  /**
   * Liste des BV de gestion pour l'autocomplete
   */
  listBvGestions: BvGestion[] = [];

  /**
   * Observable de la liste des BV de gestion pour l'autocomplete
   */
  listBvGestionObservable: Observable<BvGestion[]>;

  /**
   * Data des BV de gestion du backend
   */
  dataBvGestions: BvGestion[] = [];
  /**
   * Form group du formulaire du BV
   */
  formBvGestion: FormGroup;

  /**
   * Variable permettant d'afficher ou de cacher le label
   * des éléments sélectionnés.
   */
  isHidden: boolean;

  /**
   * Garde l'index du dernier élément sélectionné
   */
  indexElementSelected = 0;
  /**
   * La clé de validation d'erreur
   */
  readonly bvGestionValidatorKey = 'bgNotFound';

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  // localisationPertinenteHasError = verifierLocalisationPeritenteErreur(this.currentOperation);

  get bvGestionsControl() { return this.formBvGestion.get('bvGestionControl') };

  constructor(private dossierService: DossierService,
    private _formBuilder: FormBuilder,
    public translate: TranslateService) {
    super(dossierService);
  }

  ngOnInit() {
    this.formBvGestion = this._formBuilder.group({
      bvGestionControl: []
    })

    // Si la liste des BV de gestion est vide
    if (!this.currentOperation.bvGestionNatureOperations) {
      this.currentOperation.bvGestionNatureOperations = [];
    }

    this.isHidden = false;

    // Récuperation des BV de gestion
    this.dossierService.getBvGestions().subscribe((bvGestions) => {

      this.dataBvGestions = bvGestions;
      this.listBvGestions = differenceBy(this.dataBvGestions, this.currentOperation.bvGestionNatureOperations, 'numero');
      this.listBvGestions.sort(this.sortingBvGestion);
      // Set synchronous validator once the data is available
      this.bvGestionsControl.setValidators([
        GeneriqueListValeur.sigaAutocompleteValidatorFactory(this.listBvGestions, this.bvGestionValidatorKey)
      ]);
      this.updateListBvGestionObservable();
    });

    this.bvGestionsControl.valueChanges.subscribe(valeur => {
      this.currentOperation.bvGestionError = this.bvGestionsControl.hasError('bgNotFound');
      this.bvGestionsControl.hasError('bgNotFound') ? this.currentOperation.inputErreur = this.bvGestionsControl.value : this.currentOperation.inputErreur = null;
    });
  }

  ngOnChanges() {
    // Si la liste des BV gestion est  null
    if (!this.currentOperation.bvGestionNatureOperations) {
      this.currentOperation.bvGestionNatureOperations = [];
    }

    // Filtre des Bv de gestion, pour la liste de l'autocomplete
    this.listBvGestions = this.listBvGestions = differenceBy(this.dataBvGestions, this.currentOperation.bvGestionNatureOperations, 'numero');
    // Si le formulaire est instancié
    if (this.formBvGestion) {
      // S'il y a une erreur de saisie d'un bv de gestion
      if (this.currentOperation.inputErreur) {
        this.isHidden = true;
        this.bvGestionsControl.patchValue(this.currentOperation.inputErreur);
      } else {
        this.bvGestionsControl.patchValue(null);
        if (this.currentOperation.bvGestionNatureOperations.length > 0) {
          this.isHidden = false;
        }
      }
      this.updateListBvGestionObservable();
    }
  }

  /**
   * Pour le format d'affichage
   * @param bvGestion
   */
  displayBvGestions(bvGestion: BvGestion): string | undefined {
    if (bvGestion) {
      return `${bvGestion.numero} - ${bvGestion.nom}`;
    }
  }

  /**
 * Fonction de comparaison de BvGestion par numéro
 * @param a Région
 * @param b Région suivant
 */
  sortingBvGestion(a: BvGestion, b: BvGestion): number {
    if (a.numero < b.numero) {
      return -1;
    }
    if (a.numero > b.numero) {
      return 1
    }
    return 0;
  }

  /**
   * Permet d'enregistrer dans le tableau des BV gestion de currentOperation
   * @param event
   */
  OnOptionSelected(event: MatAutocompleteSelectedEvent) {
    this.bvGestionsControl.patchValue(null);
    // Recupération de l'index de l'élément sélectionné
    const index = this.getIndexElement(event.option.value);
    if (index >= 0) {
      // Suppression du Bv sélectionné dans la liste de currentOperation
      this.listBvGestions.push(this.currentOperation.bvGestionNatureOperations[index]);
      this.listBvGestions.sort(this.sortingBvGestion);
      this.currentOperation.bvGestionNatureOperations.splice(index, 1);

    } else {
      // Ajout du Bv sélectionné dans la liste de currentOperation
      this.currentOperation.bvGestionNatureOperations.push(event.option.value);
      this.currentOperation.bvGestionNatureOperations.sort(this.sortingBvGestion);
      this.listBvGestions.sort(this.sortingBvGestion);
      const indexPop = this.listBvGestions.indexOf(event.option.value)
      this.listBvGestions.splice(indexPop, 1);
    }
    // Mise à jour de la liste observable des BV de gestion
    this.updateListBvGestionObservable();
    // Activation edit mode
    this.eventBvEditMode.emit(true);
    if (verifierLocalisationPertinenteErreur(this.currentOperation)) {
      this.currentOperation.localisationPertinenteError = true;
    } else { this.currentOperation.localisationPertinenteError = false; }
  }

  /**
   * Permet de mettre à jour la liste observable des Bv de gestion pour l'autocomplete
   */
  updateListBvGestionObservable() {
    this.listBvGestions.sort(this.sortingBvGestion);
    this.listBvGestionObservable = this.bvGestionsControl.valueChanges
      .pipe(
        startWith(''),
        map(value => (value && this.bvGestionsControl.hasError(this.bvGestionValidatorKey)) ?
          this.filterBvGestions(value, this.listBvGestions, minSearchLength) : this.listBvGestions.slice()
        )
      );
  }

  /**
   * Manages how a standard SIGA list value is filtered upon user input
   * @param userInput user input in field
   * @param listValues the generic listValue to filter (should be of type {ListValeur})
   * @param searchLength number of characters to start filtering
   */
  filterBvGestions(userInput: string, listValues: any[], searchLength: number) {
    return listValues.filter(bvGestion => {
      let result = false;
      if (userInput.length < searchLength) {
        return (bvGestion.numero.toLowerCase().search(userInput.toString().toLowerCase()) === 0)
      }
      bvGestion.nom.toLowerCase().split(' ').forEach(word => {
        if (word.search(userInput.toString().toLowerCase()) === 0) {
          result = true;
        }
      });
      return (bvGestion.numero.toLowerCase().search(userInput.toString().toLowerCase()) === 0) || result;
    });
  }

  /**
   * Supprime un BV sélectionné
   * @param optionDelete
   */
  onDeleteEvent(optionDelete: any) {
    const index = this.getIndexElement(optionDelete);
    if (index >= 0) {

      // Suppression de l'élément
      this.listBvGestions.push(this.currentOperation.bvGestionNatureOperations[index]);
      this.listBvGestions.sort(this.sortingBvGestion);
      this.currentOperation.bvGestionNatureOperations.splice(index, 1);
      this.updateListBvGestionObservable();

      // Activation edition mode
      this.eventBvEditMode.emit(true);
    }
    if (verifierLocalisationPertinenteErreur(this.currentOperation)) {
      this.currentOperation.localisationPertinenteError = true;
    } else { this.currentOperation.localisationPertinenteError = false; }
  }

  /**
   * Retourne l'index d'un BV de gestion de la liste de currentOperation
   * @param motif
   */
  getIndexElement(motif: any): number {
    if (this.currentOperation.bvGestionNatureOperations !== undefined) {
      return this.currentOperation.bvGestionNatureOperations.findIndex(bvgestion => {
        return bvgestion.nom === motif;
      });
    }
    return -1;
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
    if (!this.bvGestionsControl.value) {
      this.isHidden = false;
    }
    this.bgGestionInput.nativeElement.blur();

    this.currentOperation.bvGestionError ? this.erreurEventBv.emit(true) : this.erreurEventBv.emit(false);
    if (!this.bvGestionsControl.value && verifierLocalisationPertinenteErreur(this.currentOperation)) {
      this.currentOperation.localisationPertinenteError = true;
    }

  }

  onInput(event) {
    this.currentOperation.localisationPertinenteError = false;
  }

}
