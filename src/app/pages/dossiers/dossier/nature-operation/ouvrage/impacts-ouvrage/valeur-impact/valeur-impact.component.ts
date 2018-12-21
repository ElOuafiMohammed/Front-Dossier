import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { minSearchLength } from 'app/shared/methodes-generiques';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import * as moment from 'moment';
import { ViewCell } from 'ng2-smart-table';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { LabelTranslate } from '../../../../../../../shared/label-translate.class';
import NumberUtils from '../../../../../../../shared/utils/number-utils';
import { FormatMonetairePipe } from '../../../../../../../theme/pipes/formatMonetaire/format-monetaire.pipe';
import { FrenchDateRegex } from '../../../../../dossiers.interface';
import { ImpactOuvrages, ValeursPossibles } from '../../tableau-dynamique-ouvrage/tableau-dynamique-ouvrage.interface';

@Component({
  selector: 'siga-valeur-impact',
  templateUrl: './valeur-impact.component.html',
  styleUrls: ['./valeur-impact.component.scss']
})
export class ValeurImpactComponent implements OnInit, ViewCell {

  value: any;

  /**
  * Input row
  */
  @Input() rowData: ImpactOuvrages;

  /**
  * Variable to notify parent
  */
  @Output() ErrorMessageImpact: EventEmitter<any> = new EventEmitter();


  /**
   * Variable to notify parent if there are modification
   */
  @Output() editionMessageImpact: EventEmitter<any> = new EventEmitter();

  /**
  * Element ref of input field number
  */
  @ViewChild('valeurImpactNumber') valeurImpactNumber: ElementRef;


  /**
 * Element ref of input field liste
 */
  @ViewChild('listeAutoComplete') listeAutoComplete: ElementRef;

  /**
  * Element ref of input field reel
  */
  @ViewChild('valeurImpactReel') valeurImpactReel: ElementRef;

  /**
   * Les type de champs possible
   */
  valeurType: string[] = ['E', 'T', 'L1', 'D', 'R'];

  /**
   * La date maxi pour la validation
   */
  maxDate = new Date();

  /**
   * La date min pour la validation
   */
  minDate = new Date(1950, 0, 1);

  /**
   * Le form controleur pour le text
   */
  controlValeur: FormControl;

  /**
   * Le form controleur pour le nombre
   */
  controlValeurNumber: FormControl;


  /**
    * Le form controleur pour le reel
    */
  controlValeurReel: FormControl;

  /**
    * Value length of input of montant avance DP
    */
  valueLength: any;

  /**
   * Le form controleur pour la date
   */
  controlValeurDate: FormControl;

  /**
   * Le form controleur pour pour la liste des valeurs
   */
  controlValeurImpactListe: FormControl;

  /**
   * Le form controleur pour pour la liste des valeurs à choix unique
   */
  controlValeurImpactListeChoixUnique: FormControl;

  /**
   * Object de traduction
   */
  labelTranslate: LabelTranslate;

  /**
   * Regex pour les dates
   */
  dateRegex: RegExp;

  /**
   * Current value number'input
   */
  valueCurrentNumber: string;

  /**
   * Current value reel'input
   */
  valueCurrentReel: string;

  /**
   * Current value text'input
   */
  valueCurrentText: string;

  /**
   * Variables pour la gestion de la liste des valeurs et des valeurs selectionnées
   */
  impactListeValeurChoixUniqueObservable: Observable<string[]>;
  selected: string = null;

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  constructor(public _formatMonetairePip: FormatMonetairePipe, private translate: TranslateService,
    private dossierService: DossierService) {
    this.labelTranslate = new LabelTranslate(this.translate);
    this.dateRegex = FrenchDateRegex;
  }

  /**
   *
   */
  ngOnInit() {
    this.initFunction();
  }

  /**
   * Function initiation des inputs
   */
  initFunction() {
    if (this.rowData) {
      // Si la valeur est un type Nombre
      if (this.rowData.parametreDonneeSpec.typeDonnee === this.valeurType[0]) {
        this.controlValeurNumber = new FormControl(this.rowData.valeurInteger);
        this.valueCurrentNumber = this.controlValeurNumber.value ? this.controlValeurNumber.value : '';
        // Si la valeur est un type Text
      } else if (this.rowData.parametreDonneeSpec.typeDonnee === this.valeurType[1]) {
        this.controlValeur = new FormControl(this.rowData.valeurString);
        this.valueCurrentText = this.controlValeur.value;
        // Si la valeur est un type Liste valeur à choix unique
      } else if (this.rowData.parametreDonneeSpec.typeDonnee === this.valeurType[2]) {
        this.controlValeurImpactListeChoixUnique = new FormControl();
        if (this.rowData.valeurListe) {
          this.controlValeurImpactListeChoixUnique.setValue(this.rowData.valeurListe);
        }
        this.updateListeChoixUniqueObservable(this.rowData.parametreDonneeSpec.codeListe);
        // Si la valeur est un type Date
      } else if (this.rowData.parametreDonneeSpec.typeDonnee === this.valeurType[3]) {
        this.controlValeurDate = new FormControl();
        this.controlValeurDate.setValue(this.rowData.valeurDate)
        this.controlValeurDate.valueChanges.subscribe(value => {
          this.controlImpactValeurDate(value, this.controlValeurDate);
        })
        // Si la valeur est un type reel
      } else if (this.rowData.parametreDonneeSpec.typeDonnee === this.valeurType[4]) {
        this.controlValeurReel = new FormControl(this.rowData.valeurDouble);
        const value: string = this.controlValeurReel.value ? (this.controlValeurReel.value).toString() : '';
        const deuxPartie = (value && value.indexOf('.') !== -1) ? value.split('.') : '';
        this.controlValeurReel.setValue(deuxPartie[0] && deuxPartie[0].length > 2 && deuxPartie[1] ? this._formatMonetairePip.transform(value).toString() + '.' + deuxPartie[1] :
          this._formatMonetairePip.transform(value).toString());
        this.valueCurrentReel = this.controlValeurReel.value ? this.controlValeurReel.value : '';
      }
    }
  }


  /**
   * Function to detect changes of value of control string
   */
  onBlurStringEvent() {
    this.notifyParentEdition((this.rowData.valeurString !== this.controlValeur.value));
    this.rowData.valeurString = this.controlValeur.value;
    if (this.rowData.erreurValeur) {
      this.rowData.erreurValeur = false;
    }
    this.notifyparentComponent(this.rowData.erreurValeur);
  }

  onBlurDateEvent() {
    this.notifyParentEdition((this.rowData.valeurDate !== this.controlValeurDate.value));
    this.controlImpactValeurDate(this.controlValeurDate.value, this.controlValeurDate);
    this.notifyparentComponent(this.rowData.erreurValeur);
  }

  /**
    * Function to detect changes of value of control number
    */
  onBlurNumberEvent() {
    this.notifyParentEdition((this.rowData.valeurInteger !== this.controlValeurNumber.value));
    let value = this.controlValeurNumber.value ? this.controlValeurNumber.value : '';
    value = NumberUtils.toNumber2(value);
    this.controlValeurNumber.setValue(this._formatMonetairePip.transform(value.toString()));
    this.rowData.valeurInteger = value;
  }

  /**
   * Function to detect changes of value of control reel
   */
  onBlurReelEvent() {
    this.notifyParentEdition((this.rowData.valeurDouble !== this.controlValeurReel.value));
    const value: any = this.controlValeurReel.value ? (this.controlValeurReel.value).toString() : '';
    const deuxPartie = value ? value.split('.') : '';
    let valueReel = '';
    if (deuxPartie[1] && deuxPartie[1].length < 1) { deuxPartie[1] = '00' }
    valueReel = this.controlValeurReel.value ? this.controlValeurReel.value : '';
    this.controlValeurReel.setValue(deuxPartie[0] && deuxPartie[0].length > 2 && deuxPartie[1] ? this._formatMonetairePip.transform(valueReel).toString() + '.' + deuxPartie[1] :
      this._formatMonetairePip.transform(valueReel).toString());
    this.rowData.valeurDouble = valueReel;
    if (this.rowData.erreurValeur) {
      this.rowData.erreurValeur = false;
    }
    this.notifyparentComponent(this.rowData.erreurValeur);
  }


  /**
  *Character no supported
  * @param control
  */
  onlyNumber(control: any, event?: any) {
    const positionInit = event && event.target ? event.target.selectionStart : '';
    if (this.valueLength > 1) {
      control.setValue(NumberUtils.onlyNumberSecond(control.value));
    } else {
      control.setValue(NumberUtils.onlyNumber(control.value));
    }
    this.valueLength = control.value.length;
    if (event && event.target) {
      event.target.selectionEnd = positionInit;
    }
  }

  /**
  *Character no supported
  * @param control
  */
  onlyReel(control: any, event?: any) {
    let value = this.controlValeurReel.value ? this.controlValeurReel.value : '';
    const positionInit = event && event.target ? event.target.selectionStart : '';
    value = NumberUtils.onlyReel(value);
    if (value.length > 10 && (value.indexOf('.') === -1)) {
      value = value.slice(0, 10);
    }
    control.setValue(value);
    this.valueLength = control.value.length;
    if (event && event.target) {
      event.target.selectionEnd = positionInit;
    }
  }
  /**
   * Event focus function
   */
  onFocusNumber() {
    this.valueLength = this.controlValeurNumber.value.length;
  }

  refixCursorForIETab(event: any) {
    const positionInit = event && event.target ? event.target.selectionStart : '';
    if (event && event.target) {
      if (positionInit === 0) {
        event.target.selectionEnd = 1;
      } else {
        event.target.selectionStart = 0;
      }
    }
  }


  /**
   *Event click function
   * @param control
   * @param event
   */
  onClick(control: any, event?: any) {
    let positionInit = event && event.target ? event.target.selectionStart : '';
    if (control.value === 0) {
      this.refixCursorForIETab(event);

    } else {
      const value: string = control.value ? (control.value).toString() : '';
      let inddexBlock;

      if (value.indexOf(' ') !== -1) {

        switch (value.replace(/ /g, '').length % 3) {
          case 0:
            inddexBlock = 3;
            break;
          case 1:
            inddexBlock = 1;
            break;
          case 2:
            inddexBlock = 2;
            break;
        }
        if (positionInit > inddexBlock + 8) {
          positionInit -= 3;
        } else if (positionInit > inddexBlock + 4) {
          positionInit -= 2;
        } else if (positionInit > inddexBlock) {
          positionInit--;
        }
      }

      if (event && event.target) {
        if (event.target.selectionEnd === event.target.selectionStart) {
          if (value && value.indexOf('.') === -1) {
            control.setValue(NumberUtils.toNumber2(value));
          } else {

            const deuxPartie = control.value ? control.value.split('.') : '';
            let valueReel: any = 0;
            valueReel = (deuxPartie[1]) ? NumberUtils.toNumber2(value.toString()) + '.' + deuxPartie[1] :
              NumberUtils.toNumber2(value.toString());

            control.setValue(valueReel);
          }

          event.target.selectionEnd = positionInit;
          if (this.valeurImpactNumber) {
            this.valeurImpactNumber.nativeElement.setSelectionRange(positionInit, positionInit, 'none');
          }
          if (this.valeurImpactReel) {
            this.valeurImpactReel.nativeElement.setSelectionRange(positionInit, positionInit, 'none');
          }
        } else {
          event.target.selectionStart = positionInit;
        }
      }
    }
  }


  /**
   * To notify parent
   * @param valid: value of error
   */
  notifyparentComponent(valid?: boolean) {
    this.ErrorMessageImpact.emit(valid);
  }

  notifyParentEdition(valid?: boolean) {
    this.editionMessageImpact.emit(valid);
  }

  /**
   *
   * @param value
   * @param control
   */
  controlImpactValeurDate(value: any, control: AbstractControl) {
    if (control.hasError('matDatepickerParse')) {
      this.erreurFonctionDate('messages.impact.erreurValeurDateInexistante');
      this.rowData.erreurValeur = true;
    } else {
      this.rowData.erreurValeur = false;
      this.rowData.valeurDate = control.value;
    }
    if (value && value._i) {
      if (value._i instanceof Object) {
        value._i = moment().format('DD/MM/YYYY');
      }
      if (!isNaN(Number(value._i)) && value._i.length > 8) {
        this.erreurFonctionDate('messages.impact.erruerValeurDateVerifierNombreChiffresSaisis');
      } else if (isNaN(Number(value._i)) && value._i > 10) {
        this.erreurFonctionDate('messages.impact.erruerValeurDateVerifierNombreChiffresSaisis');
      } else if (value._d < this.minDate) {
        this.erreurFonctionDate('messages.impact.erreurValeurDateInferieur');
      } else if (value._d > this.maxDate) {
        this.erreurFonctionDate('messages.impact.erreurValeurDateSuperieur');
      } else if (!this.dateRegex.test(value._i)) {
        this.erreurFonctionDate('messages.impact.erreurValeurDateformatInvalide');
      }
    }
  }

  /**
   * Fonction d'erreur pour les dates
   * @param codeMessage
   */
  erreurFonctionDate(codeMessage: string) {
    this.rowData.erreurValeur = true;
  }

  /**
   * Fonction d'évenement pour la liste de valeur à choix unique
   */
  onChangeImpactListeValeurChoixUnique() {
    this.rowData.valeurListe = this.controlValeurImpactListeChoixUnique.value;
    this.updateListeChoixUniqueObservable(this.rowData.parametreDonneeSpec.codeListe);
  }


  /**
   * Fonction d'affichage pour l'autocomplete de liste valeur à choix unique
   * @param valeur
   */
  displayListeValeur(valeurPossible: ValeursPossibles): string | undefined {
    if (valeurPossible) {
      return `${valeurPossible.code} - ${valeurPossible.libelle}`;
    }
  }


  /**
   * Permet de mettre à jour la liste observable de l'autocomplete
   * Pour la liste à choix unique
   */
  updateListeChoixUniqueObservable(codeListe: string) {
    const listeParametrageImpact = this.dossierService.getvaleursImpactListe(codeListe);
    this.listenChangeListe(listeParametrageImpact);
  }


  listenChangeListe(liste) {
    this.impactListeValeurChoixUniqueObservable = this.controlValeurImpactListeChoixUnique.valueChanges
      .pipe(
        startWith(''),
        map(value => value ?
          GeneriqueListValeur.filterListValeur(value, liste, minSearchLength) : liste.slice()
        )
      );
    this.impactListeValeurChoixUniqueObservable.subscribe(tab => {
      if (tab.length === 0 && this.controlValeurImpactListeChoixUnique.value) {
        this.rowData.erreurValeur = true;
      } else {
        this.rowData.erreurValeur = false;
      }
      this.notifyparentComponent(this.rowData.erreurValeur);
    })
  }

}
