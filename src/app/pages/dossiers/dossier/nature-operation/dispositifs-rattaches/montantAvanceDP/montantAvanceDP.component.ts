import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import NumberUtils from 'app/shared/utils/number-utils';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';
import { ViewCell } from 'ng2-smart-table';


@Component({
  selector: 'siga-montant-avance-dp',
  templateUrl: './montantAvanceDP.component.html',
  styleUrls: ['./montantAvanceDP.component.scss'],
})

export class MontantAvanceDPComponent implements OnInit, ViewCell {

  /**
   * Element ref du champ de saisie du montant avance
   */
  @ViewChild('montantAvanceDispositif') montantAvanceDispositif: ElementRef;

  /**
   * index de la  colonne  avance
   */
  indexTabAvance = 0

  /**
   * La valeur courante du numeroOrdre du formulaire
   */
  public value: string;

  /**
   * Table de dispositif
   */
  @Input() rowData: any;

  /**
   * L'événement du dispositif courant modifié
   */
  @Output() updateDispositifEvent: EventEmitter<any> = new EventEmitter();

  /**
  * Contrôleur du champ de saisie du montant avance d'un DP
  */
  control: FormControl;

  /**
   * la longueur du champ de saisie du montant avance d'un DP
   */
  valueLength: any;

  /**
   * Constructeur du composant
   * @param _formatMonetairePipe:Variable permettant de formater les montants en format monétaire
   */
  constructor(
    private _formatMonetairePipe: FormatMonetairePipe
  ) { }

  /**
   * Initialisation du composant montantAvanceDP
   */
  ngOnInit() {
    this.control = new FormControl(this.value);
  }

  /**
   * Fonction qui détecte les changements de valeur dans le contrôleur montant avance
   */
  onBlurEvent() {
    let value = this.control.value ? this.control.value : 0;
    value = NumberUtils.toNumber(value);
    this.control.setValue(this._formatMonetairePipe.transform(value.toString()));
    if (this.control.value) {
      this.rowData.montantAvance = NumberUtils.toNumber(value);
      this.updateDispositifEvent.emit(this.rowData);
    }
  }


  /**
  *Caractères  non supportés
  * @param control: Contrôleur du champ courant "montantAvance"
  */
  onlyNumber(control: any, event?: any) {
    const positionInit = event && event.target ? event.target.selectionStart : 0;

    // Si la longueur de la valeur de l'input est supperieur à 1
    if (this.valueLength > 1) {
      control.setValue(NumberUtils.onlyNumberSecond(control.value));
    } else {
      control.setValue(NumberUtils.onlyNumber(control.value));
    }
    // Récupération de la longueur de la valeur saisie
    this.valueLength = control.value.length;

    if (event && event.target) {
      event.target.selectionEnd = positionInit;
    }

  }


  refixCursorForIETab(event: any) {
    const positionInit = event && event.target ? event.target.selectionStart : 0;
    if (event && event.target) {
      if (positionInit === 0) {
        event.target.selectionEnd = 1;
      } else {
        event.target.selectionStart = 0;
      }
    }
  }

  /**
   * Pour gérer l'affichage du montant lors du clic sur le champ de saisie
   * @param event: Valeur saisie
   */
  onClick(event) {
    let positionInit = event && event.target ? event.target.selectionStart : 0;
    if (this.control.value === 0) {
      this.refixCursorForIETab(event);

    } else {
      const value: string = this.control.value ? (this.control.value).toString() : '0';
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
          this.control.setValue(NumberUtils.toNumber(value));
          event.target.selectionEnd = positionInit;
          this.montantAvanceDispositif.nativeElement.setSelectionRange(positionInit, positionInit, 'none');
        } else {
          event.target.selectionStart = positionInit;
        }

      }
    }

  }

  /**
   * Récupère la longueur de la valeur saisie lors du focus
   */
  onFocus() {
    this.valueLength = this.control.value.length;
  }
}
