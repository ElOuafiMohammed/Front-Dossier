import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatOption, MatSnackBar } from '@angular/material';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Avis } from 'app/pages/dossiers/create-dossier/create-dossier.interface';
import { AvisDossier, Dossier } from 'app/pages/dossiers/dossiers.interface';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { Critere, Settings } from 'app/pages/dossiers/recherche-dossier/recherche-dossier.interface';
import { ConfirmPopupComponent } from 'app/shared/confirm-popup/confirm-popup.component';
import { GenericVariables } from 'app/shared/generic.variables';
import { afficherErreur, afficherMessageValide, getErrorMessage, snackbarConfigError } from 'app/shared/shared.retourApi';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';
import { LocalDataSource } from 'ng2-smart-table/lib/data-source/local/local.data-source';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { SpinnerLuncher } from '../../../../shared/methodes-generiques';
import { EnumActionDossier } from '../../dossier/enumeration/enumerations';
import { DossierDataSource } from './dossier.dataSource';


@Component({
  selector: 'siga-saisir-avis',
  templateUrl: './saisir-avis.component.html',
  styleUrls: ['./saisir-avis.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class SaisirAvisComponent extends GenericVariables implements OnInit {
  /**
  * Source to be displayed in the tableTotal
  */
  sourceTotals: LocalDataSource = new LocalDataSource();
  idTosave: number[] = [];
  selected: Avis = null
  /**
  * Columns of table
  */
  displayedColumns = ['numDossier', 'libelleBenef', 'montantAide', 'avis', 'actionsColumn'];
  currentCriteres: Critere
  formResultatRecherche: FormGroup;
  dataSource: DossierDataSource;
  totalMontantAide = 0;
  nombreTotalResultats = 0;
  showResult = false;
  expanded = false;
  motifIsRequerid = false;
  valueCloseDialog = false;
  listAvis: Avis[] = [];
  avisToSave: AvisDossier[] = [];
  modified: Boolean = false;


  /*
   * Define structure of table (one Row totals)
  */
  settingsTotals: Settings = {
    actions: false,
    hideSubHeader: true,
    columns: {
      nbrDossiersTrouves: {
        type: 'html',
        width: '35%',
        filter: false,
        addable: false,
        valuePrepareFunction: () => {
          return `
          <strong> ${this.nombreTotalResultats} </strong>
          dossier(s) trouvés(s)
          `;
        }
      },
      total: {
        type: 'html',
        width: '15%',
        filter: false,
        addable: false,
        valuePrepareFunction: () => {
          return `<strong class="util-right"> Total aides </strong>`;
        }
      },
      totalMontantAide: {
        type: 'html',
        filter: false,
        width: '21.8%',
        valuePrepareFunction: (cell: any, row: any) => {
          let transformedValue = '0';
          if (row.totalMontantAide) {
            transformedValue = this.formatMonetairePipe.transform(row.totalMontantAide);
          }
          return `<div  class="util-right montant-op-recap-align-total">${transformedValue}</div>`;
        }
      },
      vide: {
        type: 'html',
        width: '1250px',
        filter: false,
        addable: false,
        valuePrepareFunction: () => {
          return '';
        }
      }
    }

  };
  summeTotalList = [{ total: '', totalMontantAide: 0 }]

  /**
   * Used to avoid multi-click from the user
   */
  submitted = false;

  private unsubscribe = new Subject<void>();
  benefInactif: boolean;
  listBenefInactif = [];

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  constructor(private _dossierService: DossierService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    public router: Router,
    private _formBuilder: FormBuilder,
    private _changeDetector: ChangeDetectorRef,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private formatMonetairePipe: FormatMonetairePipe,
    private _snackbar: MatSnackBar,
    private spinnerLuncher: SpinnerLuncher
  ) {
    super()
    this.matIconRegistry.addSvgIcon(
      'editIcon',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../../assets/img/edit-icon.svg')
    );
  }
  ngOnInit() {
    // store current and previous page
    if (this._dossierService.previousPage === '') {
      this._dossierService.previousPage = this.router.url;
    } else {
      this._dossierService.previousPage = this._dossierService.currentPage;
      if (!this._dossierService.currentPage.includes('/dossier')) {
        this._dossierService.formResultatRecherche = null;
        this._dossierService.idsCheckedDossier = [];
        this._dossierService.checkAll = null;
      }
    }
    this._dossierService.currentPage = this.router.url;

    this.formResultatRecherche = this._formBuilder.group({
      avis: [null, []],
      motif: []
    });
    this._dossierService.getSessionDecision()
      .subscribe(sessions => {
        this.sessions = sessions;
      });
    // setTimeout(() => {
    this.thematiques = this._dossierService.getThematiques();
    this.procedureDecisions = this._dossierService.getProcedureDecisions();
    this.listAvis = this._dossierService.getAvis();
    this.listAvis.forEach((avis: Avis) => {
      if (avis.code === 'F') {
        this.selected = avis;
      }
    })
    // }, this._dossierService.delay);
  }
  createAvisDossier(dossier: Dossier, avis: MatOption) {
    if (avis && avis.value.code !== 'F') {
      this.modified = true;
      this.motifIsRequerid = true;
      dossier.avis = avis.value;
      dossier['expanded'] = true;
    } else {
      dossier['expanded'] = false;
      this.motifIsRequerid = true;
      dossier.motifAvis = null;
      dossier.avis = avis.value;
    }
    const avisDossier: AvisDossier = {
      id: dossier.id,
      codeAvis: avis.value.code,
      motifAvis: dossier.motifAvis
    }
    if (this.avisToSave.length !== 0) {
      this.avisToSave = this.filterList(this.avisToSave, avisDossier);
    }
    this.avisToSave.push(avisDossier);
    this.motifIsRequerid = this.disabledMotif(this.avisToSave);
  }
  filterList(avistoSAve: AvisDossier[], avis: AvisDossier): AvisDossier[] {
    let resultats: AvisDossier[] = [];
    resultats = avistoSAve.filter(avisTmp => avis.id !== avisTmp.id)
    return resultats;
  }
  disabledMotif(avisToSave: AvisDossier[]): boolean {
    let allMotisAreOk = false;
    this.avisToSave.forEach(avisToSaveTmp => {
      if (avisToSaveTmp.motifAvis === null && avisToSaveTmp.codeAvis !== 'F') {
        allMotisAreOk = true;
      }
    })
    return allMotisAreOk;
  }
  /**
   * get the corresponding dossiers for the search
   * @param criteresRecherche Object containing the various parameters by which done the search
   */
  fetchResultatRecherche(criteresRecherche: Critere) {
    this.submitted = true;
    this.showResult = true;
    this.currentCriteres = criteresRecherche;
    this._dossierService.getResultatRecherche(criteresRecherche)
      .subscribe(
        (data) => {
          if (data) {
            this.listBenefInactif = [];
            // Init expanded dossier value, with to display the motif value
            data.dossiers.forEach((dossier: any) => {
              dossier.expanded = false;
              if (dossier.avis === null) {
                dossier.avis = this.selected;
              } else {
                this.listAvis.forEach((avis: Avis) => {
                  if (avis.id === dossier.avis.id) {
                    dossier.avis = avis;
                  }
                })
              }
            });
            // Init AVis to save
            this.initAvisToSave(data.dossiers);
            // Init the datasource using component DossierDataSource
            this.dataSource = new DossierDataSource(data.dossiers);
            // Calcul total of result
            this.nombreTotalResultats = data.dossiers.length;
            this.calculTotalMontanAide(data.dossiers);
            data.dossiers.forEach(dossier => {
              if (!dossier.beneficiaire.actif) {
                this.listBenefInactif.push(dossier)
              }
            })
            if (data.dossiers.length === this.listBenefInactif.length) {
              this.benefInactif = true
            }
            this.summeTotalList[0].totalMontantAide = this.calculTotalMontanAide((data.dossiers));
            this.loadDataSource();

          }
          this.submitted = false;
          this.spinnerLuncher.hide();
        },
        (error: HttpErrorResponse) => {
          this.spinnerLuncher.hide();
          const snackMessage = getErrorMessage(error, `La recherche de dossiers a échoué. Contacter l'administrateur.`);
          const snackbarRef = this._snackBar.open(snackMessage, 'X', snackbarConfigError);
          snackbarRef.afterDismissed()
            .subscribe(() => {
              this.submitted = false;
              this._changeDetector.detectChanges();
            });
        });
  }
  initAvisToSave(dossiers: Dossier[]) {
    this.avisToSave = [];
    let avisTmp: AvisDossier = null
    dossiers.forEach((dossier: Dossier) => {
      avisTmp = {
        id: dossier.id,
        codeAvis: dossier.avis ? dossier.avis.code : null,
        motifAvis: dossier.motifAvis
      }

      if (dossier.beneficiaire.actif) {

        this.avisToSave.push(avisTmp);
      }
    })
  }
  calculTotalMontanAide(dossiers: Dossier[]) {
    let summe = 0;
    dossiers.forEach(dossier => {
      summe += dossier.totalMontantAide;
    })
    return summe;
  }
  /**
   * Event to expand more or expand less the detail of ouvrage
   */
  toggleDetailsRow(row: Dossier): void {
    if (row['expanded'] === true) {
      this.expanded = false;
    } else {
      this.expanded = true;
    }
    row['expanded'] = this.expanded;
  }
  compareListElement(compareItem1: any, compareItem2: any) {
    return compareItem1 && compareItem2 && compareItem1.id === compareItem2.id;
  }
  isExpansionMotifDossier = (i: number, row: Object) => row.hasOwnProperty('detailRow');

  consultDossier(dossier: Dossier) {
    this.router.navigate([`dossier/${dossier.id}`]);
  }
  // Action
  saveAvis() {
    this.spinnerLuncher.show();
    this.submitted = true;
    this._dossierService.saveAvis(this.avisToSave).subscribe(avis => {
      this.spinnerLuncher.hide();
      afficherMessageValide(`Les dossiers ont bien été modifiés`, this._snackbar, this.submitted, this._changeDetector);
      this.submitted = false;
      this.modified = false;
    });
  }

  /**
   * Implements the guard canDeactivate() logic to being redirected
   */
  canDeactivate(): Observable<boolean> | boolean {
    if (this.modified) {
      return this.openConfirmDialog()
        .beforeClose().pipe(
          map((dialogResult) => {
            if (dialogResult === 'save') {
              dialogResult = true;
            }
            return dialogResult as boolean;
          }));
    }
    return true;
  }
  /**
   *Load the data in the results table
   */
  loadDataSource(): void {
    // this.source.load(this.dossiersDatas);
    const totalMontantAide: number = this.totalMontantAide;
    this.sourceTotals.load(this.summeTotalList);
  }
  /**
   * Configures OK / KO Material Dialog and returns the reference
   */
  openConfirmDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    const myDialog = this.dialog.open(ConfirmPopupComponent, {
      data: {
        valueStatusError: this.motifIsRequerid,
        typeAction: 'update'
      }
    });
    myDialog.afterClosed().subscribe(result => {
      if (result === 'save') {
        this.saveAvis();
        this.valueCloseDialog = true;
      } else if (result === true) {
        this.valueCloseDialog = true;
      } else if (result === false) {
        this.valueCloseDialog = false;
      }
    });
    return myDialog;
  }
  close() {
    this.router.navigate([`/accueil`]);
  }

  // Add motif on the current avis
  motifBlur(motifAvis, detail) {
    const idCurrentDossier = detail ? detail.element.id : null;
    let avisExistInList = false;
    // let allMotisAreOk = false;
    this.avisToSave.forEach(avis => {
      if (avis.id === idCurrentDossier) {
        avis.motifAvis = motifAvis ? motifAvis : null;
        this.modified = true;
        avisExistInList = true;
      }
    });
    if (!avisExistInList) {
      const avisDossier: AvisDossier = {
        id: idCurrentDossier,
        codeAvis: detail.element.avis.code,
        motifAvis: motifAvis
      }
      this.avisToSave.push(avisDossier);
    }
    // Add the motif on the selected dossier
    detail.element.motifAvis = motifAvis;
    this.motifIsRequerid = this.disabledMotif(this.avisToSave);
  }
  //
  aviser() {
   this.spinnerLuncher.show();
    this.submitted = true;
    this.modified = false;

    this.idTosave = this.avisToSave.map((avis: AvisDossier) => avis.id);
    this.dossierAction = {
      ids: this.idTosave,
      action: EnumActionDossier.AVISER
    }
    this._dossierService.saveAvis(this.avisToSave).subscribe(result => {
      if (result) {
        this._dossierService.bascValidDevalid(this.dossierAction)
          .subscribe(
            (data) => {
             this.spinnerLuncher.hide();
              afficherMessageValide(`Les avis ont bien été validés`, this._snackbar, this.submitted, this._changeDetector);
              this.submitted = false; this.fetchResultatRecherche(this.currentCriteres);
            },
            (error: HttpErrorResponse) => {
              this.spinnerLuncher.hide();
              afficherErreur(error, `La validation de dossiers a échoué. Contacter l'administrateur.`, this._snackbar, this._changeDetector);
              this.submitted = false;
            });
      } else {
        this.submitted = false;
       this.spinnerLuncher.hide();
      }
    })
  }
}
