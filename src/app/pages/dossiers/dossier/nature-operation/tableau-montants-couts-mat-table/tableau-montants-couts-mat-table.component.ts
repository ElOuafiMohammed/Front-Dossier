import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material';
import { CoutsTravaux } from 'app/pages/dossiers/dossiers.interface';
import NumberUtils from 'app/shared/utils/number-utils';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ComponentViewRightMode, DossierService } from '../../../dossiers.service';
import { Operation } from '../../dossier.interface';
import { MontantRetenuCellComponent } from './montant-retenu-cell/montant-retenu-cell.component';


@Component({
  selector: 'siga-app-tableau-montants-couts-mat-table',
  templateUrl: './tableau-montants-couts-mat-table.component.html',
  styleUrls: ['./tableau-montants-couts-mat-table.component.scss']
})
export class TableauMontantsCoutsMatTableComponent extends ComponentViewRightMode implements OnInit, OnChanges {


  /*********************** ANCIENNES VARIABLES COÛTS/AIDES **************************************************/
  @Output() onCoutsTravauxFormChange: EventEmitter<boolean> = new EventEmitter();
  @Output() onTotalMontantRetenuChange = new EventEmitter<{ value: number, typeMontant: string }>();
  @Output() onSpecificiteCalculFormChange = new EventEmitter<FormGroup>();
  @Output() onTotalMontantOperationChange = new EventEmitter<number>();
  validite = true;
  montantPlafonneExist = false;
  instanceRetenu: MontantRetenuCellComponent;
  montantPlafonNotNull = false;
  disableColRetenue = false;
  private unsubscribe = new Subject<void>();
  specificiteCalculMaxLength = 2000;
  validiteMontants = true;
  formSpecificiteCalcul: FormGroup;


  get specificiteCalculControl(): AbstractControl | undefined {
    if (this.formSpecificiteCalcul !== null) {
      return this.formSpecificiteCalcul.get('specificiteCalcul');
    }
  };

  get montantRetenuPLafonneControl(): AbstractControl | undefined {
    if (this.formSpecificiteCalcul) {
      return this.formSpecificiteCalcul.get('montantRetenuPLafonne');
    }
  }
  /*****************************  FIN ANCIENNES VARAIBLES  ************************************************/



  /*********************** DEBUT VARIABLES ADAPTÉES/CRÉES POUR LES MAT-TABLE ******************************/

  /**
   * Operation courante récupérer du composant parent
   */
  @Input() currentOperation: Operation;

  /**
   * data: données du tableau
   */
  data: CoutsTravaux[] = [];

  /**
   * DataSource du tableau
   */
  dataSource = new MatTableDataSource(this.data);

  /**
   * Les noms des colonnes du tableau
   */
  displayedColumns: string[] = ['libelleCout', 'montantOperation', 'montantEligible', 'montantRetenu', 'suppression'];

  /**
   * Variable permettant de faire la somme de chaque colonne du tableau
   */
  somme = { totalMontantEligible: 0, totalMontantOperation: 0, totalMontantRetenu: 0 };

  /**
   * Variable permettant d'avoir le format string de la somme de chaque colonne du tableau
   */
  sommeFormat = { totalMontantEligible: '', totalMontantOperation: '', totalMontantRetenu: '' };

  /**
   * Variable permettant de gérer l'état du bouton <<ajouter un coût>>
   */
  canAdd = true;

  /*********************** FIN VARIABLES POUR LES MAT-TABLE *************************************************/

  /**
   * 
   * @param dossierService: variable contenant les services de l'application
   * @param _formatMonetairePipe: permettant de gérer le format monetaire des montants
   */
  constructor(public dossierService: DossierService, private _formBuilder: FormBuilder, private _formatMonetairePipe: FormatMonetairePipe, ) {
    super(dossierService);
  }


  /**
   * Permettant d'initialiser le chargement des données dans le tableau
   */
  ngOnInit() {

    this.formSpecificiteCalcul = this._formBuilder.group({
      specificiteCalcul: ['', []],
      montantRetenuPLafonne: ['', []],
    });

    if (this.dossierService && this.dossierService.dossier && this.dossierService.dossier.dossierFinancier) {
      this.onTotalMontantOperationChange.emit(this.dossierService.dossier.dossierFinancier.totalMontantOperation);
    }
    /********* Nécessaire  pour les mat-table *************************************************************/
    this.loadCurrentOperation(this.currentOperation);
    this.loadDataSource();
    /*****************************************************/



    if (this.viewRight) {
      this.specificiteCalculControl.disable();
      this.montantRetenuPLafonneControl.disable()
    }

    if (this.viewAdministratif) {
      this.specificiteCalculControl.disable();
      this.montantRetenuPLafonneControl.disable()
    }
    this.setControlListenners()
  }

  /***********************  DEBUT MÉTHODES ADAPTÉES/CRÉES POUR LES MAT-TABLES  ****************************/

  /**
   * Fonction permettant de récupérer les données de l'opération courante
   * @param currentOperation: opératuon courante  
   */
  loadCurrentOperation(currentOperation) {
    if (currentOperation) {

      /********* Nécessaire  pour les mat-table **********************************************************/
      this.data = currentOperation.coutsTravaux;
      if (!currentOperation.montantCoutError) {
        currentOperation.montantCoutError = false;
      }
      //when cand = false button add coste is disabled 
      if ((this.data && this.data.length === 1 && !this.data[0].libelleCout)) {
        this.canAdd = false;
      } else {
        this.canAdd = true;
      }
      this.loadDataSource();
      /****************************************************************************************************/
      if (currentOperation.totalMontantRetenuPlafonne > 0) {
        this.montantPlafonNotNull = true;
        this.emptyColumnRetenue(currentOperation);
      } else {
        this.montantPlafonNotNull = false;
        this.disableColRetenue = false;
      }

      this.updateFormData();
    }
  }


  /**
  * Permet d'ajouter une ligne dans le tableau
  */
  onAddLine() {
    const newCoutTravaux = {
      id: null,
      libelleCout: '',
      montantOperation: 0,
      montantEligible: 0,
      montantRetenu: 0,
      errorMessage: false
    };
    this.initLine(newCoutTravaux);
    this.canAdd = false;
    this.notifyCheckParentComponent(true);
  }


  /**
   * Met à jour la variable data avec la nouvelle ligne générée
   * @param newCoutTravaux: Nouveau Objet coutTravaux
   */
  initLine(newCoutTravaux) {
    this.data.push(newCoutTravaux);
    this.loadDataSource();
  }


  /**
   * Permet le chargement des données dans le dataSource et l'initialisation des sommes de chaque colonne du tableau
   */
  loadDataSource() {
    this.formatAllAmount();
    this.dataSource = new MatTableDataSource(this.data);
    this.initSommeTable();
  }

  /**
 * Reformate all amount be
 */
  formatAllAmount() {
    if (this.data) {
      this.currentOperation.coutsTravaux.forEach(value => {
        value.montantEligible = this._formatMonetairePipe.transform(value.montantEligible);
        value.montantOperation = this._formatMonetairePipe.transform(value.montantOperation);
        value.montantRetenu = this._formatMonetairePipe.transform(value.montantRetenu);
      })
    }
  }


  /**
   * Permet d'initialiser la somme de chaque colonne du tableau
   */
  initSommeTable() {
    this.somme.totalMontantOperation = 0;
    this.somme.totalMontantEligible = 0;
    this.somme.totalMontantRetenu = 0;
    this.data.forEach((cout) => {
      if (cout.montantOperation) {
        this.somme.totalMontantOperation += NumberUtils.toNumber(cout.montantOperation);
      }
      if (cout.montantEligible) {
        this.somme.totalMontantEligible += NumberUtils.toNumber(cout.montantEligible);
      }
      if (cout.montantRetenu) {
        this.somme.totalMontantRetenu += NumberUtils.toNumber(cout.montantRetenu);
      }
    });


    if (this.currentOperation.totalMontantRetenu !== this.somme.totalMontantRetenu && this.isMontantPlafonne()) {
      this.onTotalMontantRetenuChange.emit({ value: this.somme.totalMontantRetenu, typeMontant: 'totalRetenu' });
    }
    if (this.formSpecificiteCalcul && this.montantRetenuPLafonneControl.value > 0) {
      this.onTotalMontantRetenuChange.emit(this.montantRetenuPLafonneControl.value);
    }

    this.currentOperation.totalMontantRetenu = this.somme.totalMontantRetenu;
    this.currentOperation.totalMontantOperation = this.somme.totalMontantOperation;
    this.currentOperation.totalMontantEligible = this.somme.totalMontantEligible;
    this.sommeFormat.totalMontantOperation = this._formatMonetairePipe.transform(this.somme.totalMontantOperation);
    this.sommeFormat.totalMontantEligible = this._formatMonetairePipe.transform(this.somme.totalMontantEligible);
    this.sommeFormat.totalMontantRetenu = this._formatMonetairePipe.transform(this.somme.totalMontantRetenu);
  }


  /**
  * Permet de supprimer la ligne sélectionnée
  * @param ligne
  */
  onDeleteApplicationEvent(ligne) {
    this.data.splice(this.data.indexOf(ligne), 1);
    this.totalOperationForDossierFinacier();
    if (this.data.length === 0) {
      this.onAddLine();
      this.currentOperation.erreurMontant = false;
      this.currentOperation.montantCoutError = false;
      this.canAdd = false;
    } else {
      this.canAdd = true;
    }
    this.searchError();
    if (this.validiteMontants) {
      this.currentOperation.erreurMontant = false;
      this.notifyCheckParentComponent(true);
    }
    this.loadDataSource();
  }

  /**
   * Permet de mettre à jour les colonnes concernées après modification
   * @param row: La ligne courante 
   * @param nameColumn: le nom de la colonne courante 
   */
  onBlurEvent(row: any, nameColumn) {
    this.data.forEach(element => {
      if (element === row) {

        switch (nameColumn) {
          case 'montantOperation': {
            row.montantOperation = this._formatMonetairePipe.transform(row.montantOperation);
            this.totalOperationForDossierFinacier();
            if (row && NumberUtils.toNumber(row.montantEligible) === NumberUtils.toNumber(row.montantRetenu) && NumberUtils.toNumber(row.montantEligible) === 0) {
              row.montantEligible = row.montantOperation;
              row.montantRetenu = row.montantOperation;
            }
            break;
          }
          case 'montantEligible': {
            row.montantEligible = this._formatMonetairePipe.transform(row.montantEligible);
            break;
          }
          case 'montantRetenu': {
            row.montantRetenu = this._formatMonetairePipe.transform(row.montantRetenu);

            const montantPlafonneValue = NumberUtils.toNumber(this.montantRetenuPLafonneControl.value);
            if (montantPlafonneValue > 0) {
              this.montantPlafonNotNull = true;
            } else {
              this.montantPlafonneExist = false;
              this.montantPlafonNotNull = false;
            }
            break;
          }
        }
      }
    })
    this.initSommeTable();
    this.checkRowErrors(row);
    this.searchError();
    this.onEditEvent(row);
    this.loadDataSource();
  }


  /**
   * Permet de mettre à jour les variables hasError et canAdd pour gérer 
   * respectivement les erreurs et l'état du bouton << Ajouter un coût >>
   * @param row: ligne courante 
   */
  checkRowErrors(row: any) {
    row.hasError = false;
    if ((NumberUtils.toNumber(row.montantOperation) < NumberUtils.toNumber(row.montantEligible) ||
      NumberUtils.toNumber(row.montantEligible) < NumberUtils.toNumber(row.montantRetenu) ||
      NumberUtils.toNumber(row.montantOperation) < NumberUtils.toNumber(row.montantRetenu)) &&
      (NumberUtils.toNumber(this.currentOperation.totalMontantRetenuPlafonne) === 0 || NumberUtils.toNumber(this.currentOperation.totalMontantRetenuPlafonne === null))) {
      row.hasError = true;
      this.canAdd = false;
    } else {
      row.hasError = false;
      this.canAdd = true;
    }
    if (NumberUtils.toNumber(this.currentOperation.totalMontantRetenuPlafonne) > 0 && NumberUtils.toNumber(row.montantEligible) > NumberUtils.toNumber(row.montantOperation)) {
      row.hasError = true;
      this.canAdd = false;
    }

  }


  /**
    * Sends back the updated form to the parent component to manage validation
    *  @param data it is the linesPrev in table Prev
   */
  notifyCheckParentComponent(valid?: boolean) {
    this.onCoutsTravauxFormChange.emit(valid);
  }

  /**
  * Permet de rechercher les erreurs dans tout le data qui alimente le tableau, met à jour le canAdd
  * et met à jour les variables d'erreur  d'opération courante
  */
  searchError() {
    this.validiteMontants = true;
    this.currentOperation.montantCoutError = false;
    let findError = false;
    this.data.forEach(row => {
      if (row.hasError) {
        findError = true;
      }
      if (!row.libelleCout) {
        this.canAdd = false;
      }
    });
    this.currentOperation.erreurMontant = findError;
    this.currentOperation.montantCoutError = findError;
    this.notifyCheckParentComponent(!findError);
    this.validiteMontants = !findError;
  }

  /***********************  FIN MÉTHODES POUR LES MAT-TABLES  *********************************************/


  /****************   DÉBUT ANCIENNES MÉTHODES DE COÛTS/AIDES   *******************************************/


  ngOnChanges() {
    this.loadCurrentOperation(this.currentOperation);
    if (this.currentOperation && this.currentOperation.totalMontantRetenuPlafonne > 0) {
      this.montantPlafonneExist = true
    }
  }

  montantRetenuPlafonneOnBlur(montantRetenuPLafonne: any) {
    if (typeof montantRetenuPLafonne !== 'number') {
      montantRetenuPLafonne = NumberUtils.toNumber(montantRetenuPLafonne);
      this.montantRetenuPLafonneControl.setValue(this._formatMonetairePipe.transform(montantRetenuPLafonne), { emitEvent: false });
    }

    if (montantRetenuPLafonne > this.currentOperation.totalMontantRetenu) {
      this.montantRetenuPLafonneControl.setErrors({ 'montantOverTotalMontantRetenu': true });
      this.montantRetenuPLafonneControl.markAsTouched();
    }

    if (montantRetenuPLafonne === 0 || montantRetenuPLafonne === null) {
      this.montantRetenuPLafonneControl.setValue(null);
      this.montantPlafonNotNull = false;
      this.montantPlafonneExist = false;
      this.data.forEach(row => {
        this.emptyColumnRetenue(row);
        this.checkRowErrors(row)

      })
    } else {
      this.montantPlafonNotNull = true;
      this.montantPlafonneExist = true;
      this.data.forEach(row => {
        this.emptyColumnRetenue(row);
        this.checkRowErrors(row)
      })
    }

    this.loadDataSource();
    if (montantRetenuPLafonne > 0) {
      this.onTotalMontantRetenuChange.emit({ value: montantRetenuPLafonne, typeMontant: 'plafonne' });
    } else {
      this.onTotalMontantRetenuChange.emit({ value: this.currentOperation.totalMontantRetenu, typeMontant: 'totalRetenu' });
    }
    this.notifyChangeParentComponent();
  }


  emptyColumnRetenue(row) {
    if (this.montantPlafonNotNull) {
      row.retenu = null;
      this.disableColRetenue = true;
    } else {
      this.disableColRetenue = false;
    }
    this.loadDataSource();
  }

  resetMontantRetenuPLafonneInput() {
    this.montantRetenuPLafonneControl.setValue(null);
  }


  /**
    * Sends back the updated form to the parent component to manage validation
    *  @param data it is the linesPrev in table Prev
   */
  notifyChangeParentComponent() {
    this.onSpecificiteCalculFormChange.emit(this.formSpecificiteCalcul);
  }
  setControlListenners() {
    this.specificiteCalculControl.valueChanges.pipe(takeUntil(this.unsubscribe))
      .subscribe((specificiteCalcul: string) => {
        if (specificiteCalcul != null && specificiteCalcul.length > this.specificiteCalculMaxLength) {
          this.specificiteCalculControl.setErrors({ 'specificiteCalculTooLong': true });
        }
        this.notifyChangeParentComponent();
      });
    this.montantRetenuPLafonneControl.valueChanges.pipe(takeUntil(this.unsubscribe))
      .subscribe((value) => {
        this.notifyChangeParentComponent();
        if (value === 0) {
          this.montantRetenuPLafonneControl.setValue('')
        }

      });
  }


  /**
  *Character no supported
  * @param control
  */
  onlyNumber(control: any, event?: any) {
    const positionInit = event && event.target ? event.target.selectionStart : 0;
    control.setValue(NumberUtils.onlyNumber(control.value));
    if (event && event.target) {
      event.target.selectionEnd = positionInit;
    }
  }

  /**
    * Add line on key Enter (remplace by \n)
    * @param $event event
    * @param oField textAreaText
    * TODO : Add event type
    */
  addLine($event: any, oField: any) {
    if (oField.selectionStart || oField.selectionStart === '0') {
      if ($event.keyCode === 13) {
        const content = this.formSpecificiteCalcul.get('specificiteCalcul').value as string;
        this.formSpecificiteCalcul.get('specificiteCalcul').setValue(content.substring(0, oField.selectionStart) + '\n' +
          content.substring(oField.selectionStart, content.length));
      }
    }
  }

  /**
   * on edit montant componant : calculate new total
   * @param row
   */
  onEditEvent(row: CoutsTravaux) {
    if (row != null) {
      this.searchError();
      if (this.validite && !row.hasError && this.validiteMontants) {
        this.currentOperation.montantCoutError = false;
        this.currentOperation.erreurMontant = false;
        this.notifyCheckParentComponent(true);
      }
      this.initSommeTable();
    } else {
      this.currentOperation.montantCoutError = true;
      this.notifyCheckParentComponent(false);
    }
  }

  /**
 * Patches the values from the service in the form
 */
  updateFormData() {
    if (this.formSpecificiteCalcul) {
      this.formSpecificiteCalcul.patchValue({
        specificiteCalcul: this.currentOperation.specificiteCalcul,
        montantRetenuPLafonne: this.currentOperation && this.currentOperation.totalMontantRetenuPlafonne ? this._formatMonetairePipe.transform(this.currentOperation.totalMontantRetenuPlafonne) : null,
      });
    }
  }



  totalOperationForDossierFinacier() {
    if (this.dossierService.dossier && this.dossierService.dossier.dossierFinancier) {
      this.dossierService.dossier.dossierFinancier.totalMontantOperation =
        NumberUtils.toNumber(this.dossierService.dossier.dossierFinancier.totalMontantOperation) - NumberUtils.toNumber(this.currentOperation.totalMontantOperation);
      this.currentOperation.totalMontantOperation = 0;
      this.data.forEach((cout) => {
        this.currentOperation.totalMontantOperation += NumberUtils.toNumber(cout.montantOperation);
      });
      this.dossierService.dossier.dossierFinancier.totalMontantOperation += NumberUtils.toNumber(this.currentOperation.totalMontantOperation);
      this.onTotalMontantOperationChange.emit(this.dossierService.dossier.dossierFinancier.totalMontantOperation);
    }
  }

  isMontantPlafonne() {
    let plafond = 0;
    if (this.montantRetenuPLafonneControl) {
      plafond = this.montantRetenuPLafonneControl.value;
    }
    return NumberUtils.toNumber(plafond > 0);

  }

  /***********************   FIN ANCIENNES MÉTHODES COÛTS/AIDES *******************************************/

}
