import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { minSearchLength } from 'app/shared/methodes-generiques';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { ViewCell } from 'ng2-smart-table';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import NumberUtils from '../../../../../shared/utils/number-utils';
import { FormatMonetairePipe } from '../../../../../theme/pipes/formatMonetaire/format-monetaire.pipe';
import { ActionPrio, Enjeu, Pays, TypeDocument } from '../../../create-dossier/create-dossier.interface';
import { DonneeSpecifiqueThema, FrenchDateRegex, ListValeur } from '../../../dossiers.interface';
import { ComponentViewRightMode, DossierService } from '../../../dossiers.service';
import { EnumValeurType } from '../../enumeration/enumerations';


@Component({
  selector: 'siga-valeur-info-spec',
  templateUrl: './valeur-info-spec.component.html',
  styleUrls: ['./valeur-info-spec.component.scss']
})
export class ValeurInfoSpecComponent extends ComponentViewRightMode implements OnInit, ViewCell, OnDestroy {

  value: any;
  /**
   * Attribut Angular
   */
  @Input() rowData: DonneeSpecifiqueThema;
  @Output() editApplicationEventSelect: EventEmitter<boolean> = new EventEmitter();
  @Output() pageHasErrorEvent: EventEmitter<boolean> = new EventEmitter();
  private unsubscribe = new Subject<void>();

  /**
   * Constantes
   */
  maxDate = new Date();
  minDate = new Date(1950, 0, 1);
  /**
   * FormControls
   */
  controlValeurT: FormControl;
  controlValeurE: FormControl;
  controlValeurD: FormControl;
  controlValeurDate: FormControl;
  controlValeurListe: FormControl;
  controlValeurListeEnjeu: FormControl;
  controlValeurListeMiltiChoix: FormControl;
  /**
   * Variables
   */
  dateRegex: RegExp = FrenchDateRegex;
  valueCourantE: number;
  valueCourantD: string
  valueCourantText: string;
  selected: string = null;
  valueCourantDate: Date;
  valueLength: any;
  valueCourantTypeDoc: ListValeur
  valueCourantEnjeu: Enjeu
  valueListeMultiChoix: ActionPrio[];
  typeEntier = null;
  typeDecimal = null;
  typeTexte = null;
  typeDate = null;
  typeListe = null;
  typeListeMultiChoix = null;

  /**
   * Readonly
   */
  readonly enjeuValidatorKey = 'enjeuValidatorKey';
  readonly typeDocValidatorKey = 'typeDocValidatorKey';
  /**
   * variable liste
   */
  listeEnjeu: Enjeu[] = [];
  listeValeurs: TypeDocument[] = [];
  listevaleursMultiChoix: ListValeur[] = [];
  listePays: Pays[];
  filteredListeValeur: Observable<any[]>;

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  constructor(private _formatMonetairePip: FormatMonetairePipe, private _dossierService: DossierService) {
    super(_dossierService)
  }
  ngOnInit() {
    if (this.rowData) {
      this.initValue();
    }
    this.controlListeners();
  }

  initValue() {
    // Si la valeur est un type Nombre
    if (this.rowData.parametreDonneeSpec.typeDonnee === EnumValeurType.Entier) {
      this.typeEntier = EnumValeurType.Entier;
      this.controlValeurE = new FormControl(this.rowData.valeurInteger);
      this.valueCourantE = this.controlValeurE !== null ? this.controlValeurE.value : null;
    } else if (this.rowData.parametreDonneeSpec.typeDonnee === EnumValeurType.Décimal) {// Si la valeur est un type Décimal
      this.typeDecimal = EnumValeurType.Décimal;
      this.controlValeurD = new FormControl(this.rowData.valeurDouble);
      this.valueCourantD = this.controlValeurD !== null ? this.controlValeurD.value : null;
    } else if (this.rowData.parametreDonneeSpec.typeDonnee === EnumValeurType.Texte) {// Si la valeur est un type Texte
      this.typeTexte = EnumValeurType.Texte;
      this.controlValeurT = new FormControl(this.rowData.valeurString);
      this.valueCourantText = this.controlValeurT !== null ? this.controlValeurT.value : null;
    } else if (this.rowData.parametreDonneeSpec.typeDonnee === EnumValeurType.Liste) { // Si la valeur est un type Liste
      this.typeListe = EnumValeurType.Liste;
      if (this.rowData.parametreDonneeSpec.codeListe === 'TYPE_DOC') {
        this.listeValeurs = this._dossierService.getTypeDoc();
      }
      if (this.rowData.parametreDonneeSpec.codeListe === 'PAYS') {
        this.listeValeurs = this._dossierService.getPays();
      }
      if (this.rowData.parametreDonneeSpec.codeListe === 'ZONE_PRIO') {
        this.listeValeurs = this._dossierService.getZonePrio();
      }
      if (this.rowData.parametreDonneeSpec.codeListe === 'ENJEU') {
        this.listeValeurs = this._dossierService.getEnjeu();
      }
      this.controlValeurListe = new FormControl(this.rowData.valeurListe);
      this.valueCourantTypeDoc = this.controlValeurListe !== null ? this.controlValeurListe.value : null;
      this.controlValeurListe.setValidators([
        GeneriqueListValeur.sigaAutocompleteValidatorFactory(this.listeValeurs, this.typeDocValidatorKey)
      ]);
      if (this.listeValeurs) {
        this.filteredListeValeur = GeneriqueListValeur.filtringList(this.listeValeurs, this.controlValeurListe, this.typeDocValidatorKey, minSearchLength, 'listValeur');
      }
    } else if (this.rowData.parametreDonneeSpec.typeDonnee === EnumValeurType.Date) { // Si la valeur est un type Date
      this.typeDate = EnumValeurType.Date;
      this.controlValeurDate = new FormControl(this.rowData.valeurDate);
      this.valueCourantDate = this.controlValeurDate !== null ? this.controlValeurDate.value : null;
    } else { // Si la valeur est un type Liste Multi choix
      if (this.rowData.parametreDonneeSpec.codeListe === 'TYPE_ACTION') {
        this.listevaleursMultiChoix = this._dossierService.getTypeActions();
      }
      if (this.rowData.parametreDonneeSpec.codeListe === 'ACTION_PRIO') {
        this.listevaleursMultiChoix = this._dossierService.getActionPrio();
      }
      this.typeListeMultiChoix = EnumValeurType.ListeMultiChoix;
      this.controlValeurListeMiltiChoix = new FormControl(this.rowData.valeursListe);
    }
  }

  /**
   * Function to detect changes of value of control number
   */
  onBlurNumberEvent() {
    let value = this.controlValeurE ? this.controlValeurE.value : '';
    if (value !== null && value !== '') {
      value = NumberUtils.toNumber(value);
      this.controlValeurE.setValue(this._formatMonetairePip.transform(value.toString()));
      this.candActivateInfoSpecNumberTexte(value);
      this.rowData.valeurInteger = value;
    } else {
      this.controlValeurE.setValue('');
      this.candActivateInfoSpecNumberTexte(value);
      this.rowData.valeurInteger = null;
    }

  }
  /**
   * Check if dossier is updated
   * @param newValue
   */
  candActivateInfoSpecNumberTexte(newValueNumber?: number, newValueTexte?: string) {
    if (this.rowData.valeurDouble !== newValueNumber || this.rowData.valeurString !== newValueTexte) {
      this.editApplicationEventSelect.emit(true);
    } else {
      this.editApplicationEventSelect.emit(false);
    }
  }
  /**
   *
   * @param newValue
   */
  candActivateInfoSpecList(newValue: any) {
    if (JSON.stringify(this.rowData.valeurListe) !== JSON.stringify(newValue)) {
      this.editApplicationEventSelect.emit(true);
    } else {
      this.editApplicationEventSelect.emit(false);
    }
  }
  /**
*Character no supported
* @param control
*/
  onlyNumber(control: any, event?: any) {
    // const positionInit = event && event.target ? event.target.selectionStart : 0;
    if (this.valueLength > 1) {
      control.setValue(NumberUtils.onlyNumberSecond(control.value));
    } else {
      control.setValue(NumberUtils.onlyNumber(control.value));
    }
    this.valueLength = control.value.length;
  }
  /**
 * Event focus function
 */
  onFocusNumber() {
    this.valueLength = this.controlValeurE.value ? this.controlValeurE.value.length : null;
  }
  // US 2560
  onBlurStringEvent() {
    this.candActivateInfoSpecNumberTexte(this.controlValeurT.value);
    this.rowData.valeurString = this.controlValeurT ? this.controlValeurT.value : null;
  }
  onChangeTypeListeValeur() {
    this.candActivateInfoSpecList(this.controlValeurListe.value);
    this.rowData.valeurListe = this.controlValeurListe ? this.controlValeurListe.value : null;
  }
  displayListeValeurWtih(value: ListValeur): string | undefined {
    if (value) {
      return `${value.libelle}`
    }
    return null;
  }
  closeListeValeur(control: FormControl, event: any) {
    event.stopPropagation();
    control.setValue(null);
    this.candActivateInfoSpecList(null);
    this.rowData.valeurListe = null;
  }
  controlListeners() {
    if (this.controlValeurDate) {
      this.controlValeurDate.valueChanges.subscribe(value => {
        if (value && value._i && !(value._i instanceof Object)) {
          if (!isNaN(Number(value._i)) && value._i.length > 8) {
            this.controlValeurDate.setErrors({ 'dateLength': true });
          }
          if (isNaN(Number(value._i)) && value._i.length > 10) {
            this.controlValeurDate.setErrors({ 'dateLength': true });
          }
          // vérifie que la date respecte le format jj/mm/aaaa
          if (!this.dateRegex.test(value._i)) {
            this.controlValeurDate.setErrors({ 'wrongFormat': true });
          }
        }
        if (!this.controlValeurDate.errors) {
          this.rowData.valeurDate = value._d;
          this.editApplicationEventSelect.emit(true)
          this.pageHasErrorEvent.emit(false);
        } else {
          this.pageHasErrorEvent.emit(true);
          this.editApplicationEventSelect.emit(false)
        }
      });
    }
    if (this.controlValeurListeMiltiChoix) {
      this.controlValeurListeMiltiChoix.valueChanges.pipe(takeUntil(this.unsubscribe))
        .subscribe((value: ActionPrio[]) => {
          this.candActivateInfoSpecList(value);
          this.rowData.valeursListe = value;
        });
    }
  }

  /**
     * allows to compare two objects
     * @param compareItem1;
     * @param compareItem2;
     */
  compareListElement(compareItem1: any, compareItem2: any) {
    return compareItem1 && compareItem2 && compareItem1.id === compareItem2.id;
  }

  onDeleteEventActionPrio(actionPrio: ListValeur) {
    let listActionsTmp = [];
    listActionsTmp = this.controlValeurListeMiltiChoix.value.filter(action => action.id !== actionPrio.id);
    this.controlValeurListeMiltiChoix.setValue(listActionsTmp);
    this.candActivateInfoSpecList(listActionsTmp);
    this.rowData.valeursListe = listActionsTmp;
  }
  /**
   * Remove space when user click on the amont
   * @param control 
   */
  sigaFormatNumber(control: FormControl) {
    control.setValue(NumberUtils.toNumber(control.value));
  }
  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe.next();
      this.unsubscribe.complete();
    }
  }
}
