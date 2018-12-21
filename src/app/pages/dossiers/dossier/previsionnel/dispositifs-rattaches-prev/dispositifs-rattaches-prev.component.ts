import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatTableDataSource } from '@angular/material';
import MethodeGenerique from 'app/shared/methodes-generiques';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { Subject } from 'rxjs';

import { Dispositif, PreDossier } from '../../../dossiers.interface';
import { ComponentViewRightMode, DossierService } from '../../../dossiers.service';
import { TypeDispositif } from '../../dossier.interface';

@Component({
  selector: 'siga-dispositifs-rattaches-prev',
  templateUrl: './dispositifs-rattaches-prev.component.html',
  styleUrls: ['./dispositifs-rattaches-prev.component.scss'],

})
export class DispositifsRattachesPrevComponent extends ComponentViewRightMode implements OnInit, OnChanges {

  private unsubscribe = new Subject<void>();
  /**
    * preDossier attached to dossier
    */
  @Input() preDossier: PreDossier;

  @Input() viewRight: boolean = null;
  /**
   * Event to manage error to notify parent
   */
  @Output() isFormDpRattachPrevValid: EventEmitter<any> = new EventEmitter();

  /**
  * Event to manage change and  notify parent
  */
  @Output() isFormDispositifChange: EventEmitter<any> = new EventEmitter();

  /**
  * event to go back to the parent component the configuration lines in the table Prev
  */
  @Output() onDispositifRattachesPrevChange: EventEmitter<Dispositif[]> = new EventEmitter();

  /**
  * Manage Error
  */
  enableMessageError: boolean;

  /**
  * boolean to manage error in new line of dispositif
  */
  isError: boolean;

  /**
* manage active/desactive button to add dispositif
*/
  canAdd = true;

  /**
   * Settings
   */
  settings: any = { actions: false };

  /**
   * ExpandedElement
   */
  expandedElement: any;

  /**
   * boolean to check to expand up or down
   */
  expanded = false;

  /**
   * Types Dispositif
   */
  typesDispositif: TypeDispositif[];

  /**
   * Active Dispositif list
   */
  dispositifsNonClos: Dispositif[];

  /**
    * List of dispositif
    */
  data: Dispositif[] = [];

  /**
  * message of error
  */
  messageErrorDispositif: string;

  /**
   * formDP
   */
  formDP: FormGroup;

  dataSource = new MatTableDataSource(this.data);

  /**
   * Columns of table
   */
  displayedColumns = ['urlFrontDispositifPartenariat', 'type', 'numero', 'complementIntitule', 'suppression'];

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  get typeDispositifControl() { return this.formDP.get('typeDispositif') };
  get numeroControl() { return this.formDP.get('listeNumeroDP') };

  constructor(
    private _formBuilder: FormBuilder,
    private dossierService: DossierService,
    public dialog: MatDialog) {
    super(dossierService)
  }

  /**
   * ng oninit
   */
  ngOnInit() {

    this.formDP = this._formBuilder.group({
      typeDispositif: [],
      listeNumeroDP: []
    });

    if (this.preDossier.dispositifPartenariats) {
      this.preDossier.dispositifPartenariats.forEach(rowda => {
        rowda.urlFrontDispositifPartenariat = this.dossierService.getUrlDispositifFront(rowda.id);
        rowda.numeroOrdreFormatted = this.formattedNumeroCode(rowda.numeroOrdre);
        rowda.disable = true;
      });
    }

    this.data = MethodeGenerique.deepClone(this.preDossier.dispositifPartenariats);

    this.dossierService.getTypeDispositif().subscribe(value => {
      this.typesDispositif = value;
    });

    this.manageCanAdd(true);
    this.loadDataSource();
  }

  /**
   * ng onchanges
   */
  ngOnChanges() {
    if (this.data) {
      this.data.forEach(dispositif => {
        if (dispositif.complementIntitule !== '') {
          dispositif.disable = true;
        } else {
          dispositif.disable = false;
          this.messageErrorDispositif = 'Veuillez saisir le type et le numéro du dispositif.';
        }
      });
    }
    this.loadDataSource();
  }

  /**
    * Event when a type dispositif is selected
    * @param value TypeDispositif
    * @param row Dispositif
    */
  change(typeDispositif: TypeDispositif, row: any) {
    const listeASupprimer: Dispositif[] = [];

    this.dossierService.getDispositifsNonCloturesByType(typeDispositif.id).subscribe((value) => {

      // Supprimer les dispositifs déjà rattachés
      value.forEach(dispositif => {
        this.data.forEach(disp => {

          if (dispositif.typeDispositif.code === disp.typeDispositif.code && dispositif.numeroOrdre === disp.numeroOrdre) {
            listeASupprimer.push(dispositif);
          }
        });
        dispositif.numeroOrdreFormatted = this.formattedNumeroCode(dispositif.numeroOrdre);
      });

      listeASupprimer.forEach(dispositifASupprimer => {
        value.splice(value.indexOf(dispositifASupprimer), 1);
      })

      this.dispositifsNonClos = value;

      // gérer liste vide
      if (this.dispositifsNonClos.length === 0) {
        this.messageErrorDispositif = 'Aucun dispositif trouvé pour ce type';
      } else {
        this.messageErrorDispositif = 'Veuillez saisir le type et le numéro du dispositif.';
      }
      row['typeDispositif'] = typeDispositif;
    },
      (error: HttpErrorResponse) => {
        this.messageErrorDispositif = 'Erreur survenue lors de l\'appel du référentiel Dispositif de partenariat.';
      });
  }

  /**
   * Event when a dispositif is selected
   * @param dispositif le dispositif sélectionné
   * @param row la ligne du tableau en cours de saisie
   */
  changeNumeroDispositif(dispositif: Dispositif, row: any) {

    if (dispositif) {
      row['id'] = dispositif.id;
      row['typeDispositif'] = dispositif.typeDispositif;
      row['numeroOrdre'] = dispositif.numeroOrdre;
      row['numeroOrdreFormatted'] = this.formattedNumeroCode(dispositif.numeroOrdre);
      row['complementIntitule'] = dispositif.complementIntitule;
      row['urlFrontDispositifPartenariat'] = this.dossierService.getUrlDispositifFront(dispositif.id);
      row['disable'] = true;
      dispositif.numeroOrdreFormatted = this.formattedNumeroCode(dispositif.numeroOrdre);
      dispositif.urlFrontDispositifPartenariat = this.dossierService.getUrlDispositifFront(dispositif.id);

      this.isFormDispositifChange.emit(true);
      this.manageCanAdd(true);
      this.messageErrorDispositif = '';

      this.notifyParentComponent(this.data);

    }
  }

  /**
   * load data of dispositif and sort types of dispositif
   */
  loadDataSource() {
    this.dataSource = new MatTableDataSource(this.data);
  }


  /**
  * Event add a new row in table
  */
  onAddDispositif() {
    const typeDispositif: TypeDispositif = {
      id: null,
      libelle: '',
      code: '',
      codeParam: '',
      libelleParam: '',
      texte: ''
    };
    const newDispositif: Dispositif = {
      id: null,
      typeDispositif: typeDispositif,
      numeroOrdre: null,
      complementIntitule: '',
      urlFrontDispositifPartenariat: '',
      disable: false,
      numeroOrdreFormatted: '',
      isSansObjet: false
    };

    this.data.push(newDispositif);
    this.dispositifsNonClos = [];
    this.messageErrorDispositif = 'Veuillez saisir le type et le numéro du dispositif.';
    this.manageCanAdd(false);

    this.loadDataSource();
  }

  /**
  * delete selected dispositif
  * @param  dispositifToDelete line to be deleted
  **/
  onDeleteDispositifEvent(dispositifToDelete: Dispositif): void {
    this.isError = false;
    this.data.splice(this.data.indexOf(dispositifToDelete), 1);
    this.loadDataSource();

    this.data.forEach(rowda => {
      if (rowda.complementIntitule === '') {
        this.isError = true;
      }
    });

    this.notifyParentComponent(this.data);

    if (this.isError) {
      this.isFormDispositifChange.emit(false);
      this.manageCanAdd(false);
    } else {
      this.isFormDispositifChange.emit(true);
      this.manageCanAdd(true);
    }
  }

  /**
   * managing the addition of new line of dispositif
   * @param canAddLine: value to add or not a new line of dispositif
   */
  manageCanAdd(canAddLine: boolean) {
    if (canAddLine) {
      this.isFormDpRattachPrevValid.emit(true);
      this.enableMessageError = false;
      this.canAdd = true;
    } else {
      this.isFormDpRattachPrevValid.emit(false);
      this.enableMessageError = true;
      this.canAdd = false;
    }
  }

  /**
   * Sends back the updated form to the parent component to manage validation
   *  @param data it is the dispositif partenariat in table Prev
  */
  notifyParentComponent(data: Dispositif[]) {
    this.onDispositifRattachesPrevChange.emit(data);
  }

  /**
     * Function to open other window
     * @param event: event click
     */
  goOtherWindow(event) {
    if (event) {
      window.open(event.urlFrontDispositifPartenariat, '_blank', 'toolbar=yes,scrollbars=yes,resizable=yes,top=80,left=80,width=1200');
    }
  }

  /**
   * Function to formatter a number to string with zeros
   * @param numero: number to formatter of string
   */
  formattedNumeroCode(numero: number) {
    if (numero) {
      const lengthCurrentNumero = numero.toString().length;
      let index;
      let value = '';
      for (index = 0; index < (4 - lengthCurrentNumero); index++) {
        value += '0';
      }
      return value + numero.toString();
    }
  }

  /**
  * Filter Dispositif type list
  */
  displayType(type): string | undefined {
    if (type) {
      return `${type.code}`;
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

}

