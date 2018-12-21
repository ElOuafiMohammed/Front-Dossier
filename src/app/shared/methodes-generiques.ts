import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatButton } from '@angular/material';
import { Operation } from 'app/pages/dossiers/dossier/dossier.interface';
import { Departements } from 'app/pages/dossiers/dossiers.interface';

import { Phase } from '../pages/dossiers/create-dossier/create-dossier.interface';
import { BaThemePreloader, BaThemeSpinner } from '../theme/services';



/**
 * utils CLASS to manage number
 */
export default class MethodeGenerique {

  /**
  * Fixes IE11 forms bug : Placeholders trigger and set an empty value ('') in the control.
  * This allows to reset the values to null to allow manual filtering, detection and comparison.
  * @param formGroup any angular form
   */
  static resetEmptyFormValues(formGroup: FormGroup) {
    for (const key in formGroup.controls) {
      if (formGroup.controls[key] && formGroup.controls[key].value === '') {
        formGroup.controls[key].setValue(null, { emitValue: false });
      }
    }
  }

  /**
  * Makes the ripple that makes the 'button like it is pressed' disappear
  * @param button Material button linked to a material dialog
  * @see https://github.com/angular/material2/issues/8420
  */
  static fixButtonRippleEffectBug(button: MatButton) {
    button._elementRef.nativeElement.classList.remove('cdk-program-focused');
    button._elementRef.nativeElement.classList.add('cdk-mouse-focused');
  }

  /**
   * Manages the reset of an autocomplete control (and sets the control to dirty to trigger canDeactivate)
   * @param control a control of a Form
   */
  static setToNullValue(control: FormControl) {
    control.setValue(null);
    control.markAsDirty();
  }

  static deepClone(oldArray: Object[]) {
    const newArray: any = [];
    if (oldArray) {
      oldArray.forEach((item) => {
        newArray.push(Object.assign({}, item));
      });
    }
    return newArray;
  }

  /**
   * compare two phases
   *
   * @param phase1
   * @param phase2
   * @return true : if phase1 is greater than phase2 (phase1 >= phase2)
   */
  static isPhase1SupPhase2(listPhase: Phase[], phase1: string, phase2: string) {
    let result = false;
    let indicePhase1: number;
    let indicePhase2: number;
    if (phase1 && phase2 && listPhase) {
      listPhase.forEach((phase) => {
        if (phase.code === phase1) {
          indicePhase1 = phase.noOrdre;
        }
        if (phase.code === phase2) {
          indicePhase2 = phase.noOrdre;
        }
      });
      result = (indicePhase1 >= indicePhase2) ? true : false;
    }
    return result;
  }

  /**
    * Controle le format et la longueur des dates de début et fin de validité
    * @param requestUrl url api
    * @param nameParam le nom de paramétre à ajouter dans url api
    * @param valeur la valeur du paramétre
    */
  static buildApiUrlByCriteria(requestUrl: string, nameParam: string, valeur: any): string {
    if (valeur !== null && valeur !== undefined && valeur !== '') {
      if (requestUrl.slice(-1) !== '&') {
        requestUrl += '?';
      }
      requestUrl += nameParam + '=' + valeur + '&'
    }
    return requestUrl;
  }

  /**
  * Fonction de comparaison de départements par numéro
  * @param a Département
  * @param b Département suivant
  */
  static sortingDepartement(a: Departements, b: Departements): number {
    if (a.numero < b.numero) {
      return -1;
    }
    if (a.numero > b.numero) {
      return 1
    }
    return 0;
  }
}

@Injectable()
export class SpinnerLuncher {

  constructor(private spinner: BaThemeSpinner) {
  }

  public hide() {
    BaThemePreloader.load().then((values) => {
      this.spinner.hide();
    })
  }

  public show() {
    BaThemePreloader.load().then((values) => {
      this.spinner.showWithoutBackground();
    })
  }
}
export const datePickerConfig = {
  minDate: new Date(1950, 0, 1),
  maxDate: new Date()
}
/**
 * If the length of the searched input is above this number we search it also on the libelle
 */
export const minSearchLength = 3;

/**
 * fonction permet de verifier la localisation pertinente
 * @param operation l'opération courrante
 */
export function verifierLocalisationPertinenteErreur(operation: Operation) {
  if (
    (operation.bvGestionNatureOperations.length == 0
      && operation.communes.length == 0 && operation.departements.length == 0
      && operation.lignesMasseEau.length == 0 && operation.regions.length == 0)
    && (operation.inputErreur == null && operation.inputCommuneErreur == null
      && operation.inputDepartementErreur == null && operation.inputRegionErreur == null
      && !operation.masseEauError)) {
    return true;
  }
  return false;
}
