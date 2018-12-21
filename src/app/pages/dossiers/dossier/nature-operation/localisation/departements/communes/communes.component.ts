import {
  Component,
  DoCheck,
  EventEmitter,
  Input,
  IterableDiffers,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { minSearchLength, verifierLocalisationPertinenteErreur } from 'app/shared/methodes-generiques';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { differenceBy } from 'lodash';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { ComponentViewRightMode, DossierService } from '../../../../../dossiers.service';
import { Communes, Operation } from '../../../../dossier.interface';

@Component({
  selector: 'siga-app-communes',
  templateUrl: './communes.component.html',
  styleUrls: ['./communes.component.scss']
})
export class CommunesComponent extends ComponentViewRightMode implements OnInit, DoCheck, OnChanges {

  /**
   * get reference of input commune
   */
  @ViewChild('input') communesInput: any;

  /**
   * input event of current operation
   */
  @Input() currentOperation: Operation;

  /**
   * Emet un évenement d'erreur(true/false) au parent
   */
  @Output() erreurEventCommune: EventEmitter<boolean> = new EventEmitter();

  /**
   * Output Event en mode édition
   */
  @Output() eventCommuneEditMode: EventEmitter<boolean> = new EventEmitter();

  /**
   * Liste de toutes les communes, récupérées par le back
   */
  listCommunes: Communes[] = [];

  /**
   * Liste des communes affichées dans la liste déroulante.
   * Lorsqu'une commune à été sélectionnée, elle est alors retirée de cette liste
   */
  listCommunesReduce: Communes[] = [];

  /**
   * Liste des communes affichées dans la liste déroulante en observable
   */
  listCommunesObservable: Observable<Communes[]>;

  /**
   * Liste des communes sélectionnées
   */
  selectedCommunes: Communes[] = [];

  iterableDiffer: any;

  isHidden: boolean;

  formCommunes = new FormGroup({
    communes: new FormControl(),
  });

  readonly communesValidatorKey = 'communesNotFound';

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  get communesControl() { return this.formCommunes.get('communes') };

  constructor(
    public dossierService: DossierService,
    public translate: TranslateService,
    private _iterableDiffers: IterableDiffers) {
    super(dossierService);
    this.iterableDiffer = this._iterableDiffers.find([]).create(null);

  }

  /**
   * Initialise la liste déroulante de communes
   */
  ngOnInit() {
    this.isHidden = false;

    // Récupère les données du back si l'operation contient des communes
    if (!this.currentOperation.communes) {
      this.currentOperation.communes = [];
    }

    // Désactive l'input si aucun départements sont sélectionnés
    if (this.currentOperation.departements === null || this.currentOperation.departements.length === 0) {
      this.communesControl.disable();
    } else {
      this.communesControl.enable();
      this.dossierService.getCommunes(this.currentOperation.departements).subscribe((commune) => {
        this.listCommunes = commune;

        this.listCommunesReduce = differenceBy(this.listCommunes, this.currentOperation.communes, 'numInsee')

        // Permet de gérer la liste de communes sélectionnées lorsqu'un département est supprimé
        // Set synchronous validator once the data is available
        this.communesControl.setValidators([
          GeneriqueListValeur.sigaAutocompleteValidatorFactory(this.listCommunesReduce, this.communesValidatorKey)
        ]);

        // Met a jour la liste déroulante
        this.updateListCommunesObservable();
      });
    }
    // Recherche d'erreur de saisie
    this.communesControl.valueChanges.subscribe(valeur => {
      this.currentOperation.communeError = this.communesControl.hasError('communesNotFound');
      if (this.communesControl.hasError('communesNotFound')) {
        this.currentOperation.inputCommuneErreur = this.communesControl.value
      } else { this.currentOperation.inputCommuneErreur = null; }
    });

  }

  ngDoCheck() {
    const changes = this.iterableDiffer.diff(this.currentOperation.departements);
    if (changes && this.dossierService.dossier.phase !== 'T40') {
      if (this.currentOperation.departements.length > 0) {
        this.communesControl.enable();
        this.dossierService.getCommunes(this.currentOperation.departements).subscribe((commune) => {
          this.listCommunes = commune;

          this.listCommunesReduce = differenceBy(this.listCommunes, this.currentOperation.communes, 'numInsee')


          // Permet de gérer la liste de communes sélectionnées lorsqu'un département est supprimé
          this.onDeleteDepartement()

          // Set synchronous validator once the data is available
          this.communesControl.setValidators([
            GeneriqueListValeur.sigaAutocompleteValidatorFactory(this.listCommunesReduce, this.communesValidatorKey)
          ]);

          // Met a jour la liste déroulante
          this.updateListCommunesObservable();
        })
      } else {
        // Cas ou le seul département est supprimé => Supprime toutes les communes
        this.communesControl.disable();
        this.currentOperation.communes = [];
      }
    }


  }

  ngOnChanges() {
    if (this.dossierService.dossier.phase === 'T40') {
      // Supprime les élements ajoutés non enregistrés
      this.selectedCommunes = []

      // Récupere la liste entiere des communes et update
      this.listCommunesReduce = this.listCommunes
    } else {

      // Récupère les données du back si la liste des communes est vide
      if (!this.currentOperation.communes) {
        this.currentOperation.communes = [];
      }
    }
    // Si le formulaire est instancié
    if (this.formCommunes) {
      // S'il y a une erreur de saisie d'une commune
      if (this.currentOperation.inputCommuneErreur) {
        this.isHidden = true;
        this.communesControl.setValue(this.currentOperation.inputCommuneErreur);
      } else {
        this.communesControl.patchValue(null);
        if (this.currentOperation.communes.length > 0) {
          this.isHidden = false;
        }
      }
      this.updateListCommunesObservable();
    }
    this.listCommunesReduce = differenceBy(this.listCommunes, this.currentOperation.communes, 'numInsee')
    this.updateListCommunesObservable();
  }

  /**
   * Permet d'enregistrer dans le tableau 'selectedCommunes' les communes sélectionnées dans la liste déroulante
   * @param event
   */
  onCommuneSelect(event: Communes) {
    // Supression de la valeur sélectionnée dans l'input
    this.communesControl.patchValue(null);


    // Ajout dans la liste la commune sélectionnée et le communique a Dossier
    this.currentOperation.communes.push(event);

    // Suppression de la valeur sélectionnée dans la liste déroulante de communes
    const indexToDelete = this.listCommunesReduce.indexOf(event)
    this.listCommunesReduce.splice(indexToDelete, 1)

    // Met a jour la liste déroulante
    this.updateListCommunesObservable();

    // Activation edit mode
    this.eventCommuneEditMode.emit(true);
    if (verifierLocalisationPertinenteErreur(this.currentOperation)) {
      this.currentOperation.localisationPertinenteError = true;
    } else { this.currentOperation.localisationPertinenteError = false; }
  }

  /**
   * Permet de supprimer l'étiquette correspondant à une commune sélectionnée
   * Rajoute la commune supprimée à la liste déroulante
   * @param event département à supprimer
   */
  onDeleteCommune(event: Communes) {
    const indexToDelete = this.currentOperation.communes.indexOf(event);

    // Rajoute a la liste déroulante la commune supprimée et la trie
    this.listCommunesReduce.push(event);

    // Supprime la commune de la liste de départements sélectionnés (etiquettes) et de dossier
    this.currentOperation.communes.splice(indexToDelete, 1);

    // Met a jour la liste déroulante
    this.updateListCommunesObservable();

    // Activation edit mode
    this.eventCommuneEditMode.emit(true);
    if (verifierLocalisationPertinenteErreur(this.currentOperation)) {
      this.currentOperation.localisationPertinenteError = true;
    } else { this.currentOperation.localisationPertinenteError = false; }
  }

  /**
   * Met à jour la liste de départements observable
   * Permet l'affichage dans la liste déroulante et la recherche de départements en écrivant dans l'input
   * Trie les communes par numero insee
   */
  updateListCommunesObservable(): void {
    // Trie les communes
    this.listCommunesReduce.sort(this.sortingCommunes);

    // Met a jour la liste à afficher
    this.listCommunesObservable = this.communesControl.valueChanges
      .pipe(
        startWith(''),
        map(value => (value && this.communesControl.hasError(this.communesValidatorKey)) ?
          this.filterCommunes(value, this.listCommunesReduce, minSearchLength) : this.listCommunesReduce.slice()
        )
      )
  }

  /**
   * Manages how a standard SIGA list value is filtered upon user input
   * @param userInput user input in field
   * @param listValues the generic listValue to filter (should be of type {ListValeur})
   * @param searchLength number of characters to start filtering
   */
  filterCommunes(userInput: string, listValues: any[], searchLength: number) {
    return listValues.filter(commune => {
      let result = false;
      if (userInput.length < searchLength) {
        return (commune.numInsee.toLowerCase().search(userInput.toString().toLowerCase()) === 0)
      }
      commune.nomCommune.toLowerCase().split(' ').forEach(word => {
        if (word.search(userInput.toString().toLowerCase()) === 0) {
          result = true;
        }
      });
      return (commune.numInsee.toLowerCase().search(userInput.toString().toLowerCase()) === 0) || result;
    });
  }

  /**
   * Permet de gérer la suppression des communes sélectionnées (étiquettes) associées à un département
   * Lorsqu'un département est supprimé, les communes déjà sélectionnées de ce département sont supprimées
   */
  onDeleteDepartement() {
    // Garde en mémoire les communes à enlever de la liste de communes sélectionnées
    // fait la différence entre le tableau 'selectedCommunes' et 'listCommunes'
    const communesToDelete = this.currentOperation.communes.filter(i1 => !this.listCommunes.some(i2 => i1.numInsee === i2.numInsee))
    // Supprime de la liste de communes sélectionnées 'selectedCommunes' la liste gardé en mémoire
    communesToDelete.forEach(item => {
      const indexToDelete = this.currentOperation.communes.indexOf(item);
      this.currentOperation.communes.splice(indexToDelete, 1);
    });

    // Recupere uniquement les communes non ajoutées des départements sélectionnés
    // fait la différence entre le tableau 'listCommunes' et 'selectedCommunes' mis a jour
    this.listCommunesReduce = this.listCommunes.filter(i1 => !this.currentOperation.communes.some(i2 => i1.numInsee === i2.numInsee))
  }

  /**
   * Permet de déselectionner l'input après avoir choisi une commune
   *    Pour le réactiver ajouter "; blurInput()" à <mat-autocomplete (optionSelected)="..."
   */
  blurInput() {
    this.communesInput.nativeElement.blur();
  }

  /**
   * Manages how a commune should be displayed in the input
   * @param commune a given Commune to be formatted
   */
  displayCommunes(commune: any) {
    if (commune && commune.numInsee) {
      return `${commune.numInsee} - ${commune.nomCommune}`
    }
    return commune;
  }

  /**
   * sorting communes
   * @param a commune
   * @param b commune
   */
  sortingCommunes(a: Communes, b: Communes): number {
    if (a.numInsee < b.numInsee) {
      return -1;
    }
    if (a.numInsee > b.numInsee) {
      return 1
    }
    return 0;
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
    if (!this.communesControl.value) {
      this.isHidden = false;
    }
    this.communesInput.nativeElement.blur();
    this.currentOperation.communeError ? this.erreurEventCommune.emit(true) : this.erreurEventCommune.emit(false);
    if (!this.communesControl.value && verifierLocalisationPertinenteErreur(this.currentOperation)) {
      this.currentOperation.localisationPertinenteError = true;
    }
  }
  onInput(event) {
    this.currentOperation.localisationPertinenteError = false;
  }

}
