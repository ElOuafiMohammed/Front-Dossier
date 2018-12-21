import { AfterViewInit, Component, EventEmitter, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { GenericVariablesSearch } from 'app/shared/generic.variables';
import { minSearchLength } from 'app/shared/methodes-generiques';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { Subject } from 'rxjs';

import { Ligne, Thematique } from '../../../../create-dossier/create-dossier.interface';
import { DossierService } from '../../../../dossiers.service';
import { CritereLigne } from '../../../../recherche-dossier/recherche-dossier.interface';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'critere-card-ligne',
  templateUrl: './critere-card-ligne.component.html',
  styleUrls: ['./critere-card-ligne.component.scss']
})
export class CritereCardLigneComponent extends GenericVariablesSearch implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  /**
  * The object reprensenting the all criteres to search for
  */
  formCritere: FormGroup;

  @Output() searchEventEmitter: EventEmitter<CritereLigne> = new EventEmitter();
  listValide = ['Oui', 'Non'];

  private unsubscribe = new Subject<void>();

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  get thematiqueControl() { return this.formCritere.get('thematique'); }
  // get ligneControl() { return this.formCritere.get('ligne'); }
  get valideControl() { return this.formCritere.get('valide'); }
  /**
     *
     * @param _formBuilder used to create the form
     * @param _dossierService used to manage dossiers
     */

  constructor(
    private _formBuilder: FormBuilder,
    private _dossierService: DossierService,
    public translate: TranslateService
  ) {
    super()
  }

  ngOnInit() {
    this.formCritere = this._formBuilder.group({
      thematique: ['', []],
      valide: []
    }, {});
  }

  ngOnChanges() {
    //  
    if (this.formCritere && this.thematiques) {
      this.filteredThematiques = GeneriqueListValeur.filtringList(this.thematiques, this.thematiqueControl, this.thematiqueValidatorKey, minSearchLength, 'listValeur');
    }

    // if (this.formCritere && this.lignes) {
    //   this.filteredLignes = GeneriqueListValeur.filtringList(this.lignes, this.ligneControl, this.ligneValidatorKey, minSearchLength, 'ligne');
    // }
    this.lignes.sort(this.sortingLignes);

    if (this.formCritere) {
      this.valideControl.valueChanges.subscribe((data) => {
        if (data !== '' && data !== 'Oui' && data !== 'Non') {
          this.valideControl.setErrors({ 'validNotFound': true });
        }
      });
    }
  }

  /**
   * Manages how a thematic should be displayed in the input
   * @param thematique a given thematic to be formatted
   */
  displayThematique(thematique: Thematique): string | undefined {
    if (thematique) {
      return `${thematique.code}`;
    }
  }

  /**
     * Fonction de comparaison de départements par numéro
     * @param a Département
     * @param b Département suivant
     */
  sortingLignes(a: Ligne, b: Ligne): number {
    if (a.numero < b.numero) {
      return -1;
    }
    if (a.numero > b.numero) {
      return 1
    }
    return 0;
  }
  /**
   * Manages how a thematic should be displayed in the input
   * @param thematique a given thematic to be formatted
   */
  displayLigne(ligne: Ligne): string | undefined {
    if (ligne) {
      return `${ligne.numero}`;
    }
  }

  displayValide(valide: boolean): string | undefined {
    if (valide) {
      return `${valide}`;
    }
  }

  ngAfterViewInit() {
    // wait until destroy dossier component
    setTimeout(() => {
      this.updateFormData(this._dossierService.formCritere);
    }, 1500);
  }

  /**
 * Patches the values from the service in the form
 */
  updateFormData(formDataRecherche: FormGroup) {
    if (formDataRecherche !== null) {
      this.formCritere.patchValue(
        {
          thematique: this.thematiqueControl.value,
          valide: this.valideControl.value,
        }, { emitEvent: false }
      );
      this.onSubmit();
    }
  }
  onSubmit() {
    const critereToSend: CritereLigne = {
      thematique: this.thematiqueControl.value ? this.thematiqueControl.value : null,
      valide: this.valideControl.value ? (this.valideControl.value === 'Oui' ? true : false) : null,
      pageAAficher: null,
      nbElemPerPage: null,
    }
    this.searchEventEmitter.emit(critereToSend);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
