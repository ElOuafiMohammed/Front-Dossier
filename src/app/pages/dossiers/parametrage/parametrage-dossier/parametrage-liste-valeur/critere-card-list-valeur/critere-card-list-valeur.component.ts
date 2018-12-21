import { Component, EventEmitter, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { GenericVariablesSearch } from 'app/shared/generic.variables';
import { minSearchLength, SpinnerLuncher } from 'app/shared/methodes-generiques';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';

import { Thematique } from '../../../../create-dossier/create-dossier.interface';
import { ListValeur } from '../../../../dossiers.interface';
import { DossierService } from '../../../../dossiers.service';
import { CritereListValeur, CritereNatureOperation } from '../../../../recherche-dossier/recherche-dossier.interface';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'critere-card-list-valeur',
  templateUrl: './critere-card-list-valeur.component.html',
  styleUrls: ['./critere-card-list-valeur.component.scss']
})
export class CritereCardListValeurComponent extends GenericVariablesSearch implements OnInit, OnChanges {

  /**
  * The object reprensenting the all criteres to search for
  */
  formCritere: FormGroup;

  @Output() searchEventEmitter: EventEmitter<CritereNatureOperation> = new EventEmitter();

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  get thematiqueControl() { return this.formCritere.get('thematique'); }
  get ligneControl() { return this.formCritere.get('ligne'); }
  get valideControl() { return this.formCritere.get('valide'); }
  get validControl() { return this.formCritere.get('valide'); }

  /**
   *
   * @param _formBuilder used to create the form
   * @param _dossierService used to manage dossiers
   */
  constructor(
    private _formBuilder: FormBuilder,
    private _dossierService: DossierService,
    public translate: TranslateService,
    private spinnerLuncher: SpinnerLuncher
  ) {
    super()
  }

  ngOnInit() {
    this.formCritere = this._formBuilder.group({
      thematique: ['', []],
      ligne: ['', []],
      valide: [true, []]
    }, { validator: this.formCritereValidator() });
  }

  ngOnChanges() {
    if (this.formCritere && this.thematiques) {
      this.filteredThematiques = GeneriqueListValeur.filtringList(this.thematiques, this.thematiqueControl, this.thematiqueValidatorKey, minSearchLength, 'listValeur');
    }
    if (this.formCritere && this.lignes) {
      this.filteredLignes = GeneriqueListValeur.filtringList(this.lignes, this.ligneControl, this.ligneValidatorKey, minSearchLength, 'listValeur');
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
   * Manages how a ligne should be displayed in the input
   * @param ligne a given ligne to be formatted
   */
  displayLigne(ligne: ListValeur) {
    if (ligne) {
      return `${ligne.code}`;
    }
  }

  onSubmit() {
    this.spinnerLuncher.show();
    const critereToSend: CritereListValeur = {
      thematique: this.thematiqueControl.value ? this.thematiqueControl.value : null,
      ligne: this.ligneControl.value ? this.ligneControl.value : null,
      valide: this.validControl.value === true ? true : null,
      pageAAficher: null,
      nbElemPerPage: 30,
    }
    this.searchEventEmitter.emit(critereToSend);
  }

  /**
 * Custom validator that verifies at least one of the fields in the form is filled
 */
  formCritereValidator() {
    return (group: FormGroup) => {
      if (this.formCritere && this.thematiqueControl.value === ''
        && this.ligneControl.value === '') {
        return { 'noCritereFieldInputed': true }
      }
      return null;
    }
  }

}
