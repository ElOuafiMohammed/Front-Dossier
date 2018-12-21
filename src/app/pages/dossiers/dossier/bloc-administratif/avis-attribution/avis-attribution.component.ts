import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import GeneriqueListValeur from 'app/shared/generic-listValeur';
import { minSearchLength } from 'app/shared/methodes-generiques';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import AlphanumericUtils from 'app/shared/utils/alphanumeric-utils';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';
import { LocalDataSource } from 'ng2-smart-table';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Dossier } from '../../../dossiers.interface';
import { ComponentViewRightMode, DossierService } from '../../../dossiers.service';
import { Avis, Verification, DossierAdmin } from '../../dossier.interface';

@Component({
  selector: 'siga-avis-attribution',
  templateUrl: './avis-attribution.component.html',
  styleUrls: ['./avis-attribution.component.scss']
})
export class AvisAttributionComponent extends ComponentViewRightMode implements OnInit {
  dossierAdmin: DossierAdmin;
  @ViewChild('motif', { read: ElementRef }) motif: ElementRef;
  @Output() onAvisAttributionFormChange: EventEmitter<FormGroup> = new EventEmitter();

  /**
    * Source to be displayed in the table
    */
  source: LocalDataSource = new LocalDataSource();

  /**
   * Define structure of table (column and style)
  */
  settings = {
    actions: false,
    hideSubHeader: true,
    columns: {
      numeroAide: {
        title: 'N° aide',
        type: 'html',
        filter: false,
        width: '40%'
      },
      formeAide: {
        title: 'Forme d\'aide',
        type: 'html',
        filter: false,
        width: '30%'
      },
      montantAide: {
        title: 'Montant d\'aide',
        type: 'html',
        filter: false,
        width: '30%',
        valuePrepareFunction: (cell: any, row: any) => {
          let transformedValue = '0';
          if (row.montantAide) {
            transformedValue = this.formatMonetairePipe.transform(row.montantAide);
          }
          return `<div  class="util-right">${transformedValue}</div>`;
        }
      }

    }
  };

  formAvisAttribution: FormGroup;
  listAvis: Avis[] = [];
  get avisControl() { return this.formAvisAttribution.get('avis'); };
  filteredAvis: Observable<Avis[]>;
  readonly avisValidatorKey = 'avisNotFound';

  private unsubscribe = new Subject<void>();

  phaseSubscription: Subscription = null;
  dossierReadySubscription: Subscription = null;

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  get motifAvisControl() { return this.formAvisAttribution.get('motifAvis'); };
  constructor(
    private _formBuilder: FormBuilder,
    public dossierService: DossierService,
    public formatMonetairePipe: FormatMonetairePipe
  ) {
    super(dossierService);

    this.phaseSubscription = dossierService.dossierPhase$
      .subscribe(phase => {
        if (phase && this.formAvisAttribution && this.formAvisAttribution.enabled) {
          this.formAvisAttribution.disable({ emitEvent: false });
        }
        if (!phase && this.formAvisAttribution) {
          if (this.avisControl && this.avisControl.value && this.avisControl.value.libelle === 'Favorable') {
            this.avisControl.enable();
          } else {
            this.formAvisAttribution.enable({ emitEvent: false });
          }
        }
      });

    // Loads the data the first time the DossierComponent is loaded (first navigation or F5)
    this.dossierReadySubscription = dossierService.dossier$.pipe(takeUntil(this.unsubscribe))
      .subscribe(dossierReady => {
        if (dossierService.dossier) {
          // The form loads too fast for IE, so we encapsulate the whole process in a setTimeout(0) to reset the call stack
          setTimeout(() => {
            this.updateFormData(dossierService.dossier);
            if (this.viewAdministratif || this.viewRight) {
              this.formAvisAttribution.disable()
            } else if (this.avisControl.value && this.avisControl.value.libelle === 'Favorable') {
              this.avisControl.enable()
            } else {
              this.formAvisAttribution.enable()

            }
          }, 0);
        }
      });
  }

  ngOnInit() {
    this.formAvisAttribution = this._formBuilder.group({
      avis: [null],
      motifAvis: [null],
      numeroAttributif: [{ value: null, disabled: true }, []],
    });
    //  setTimeout(() => {
    this.listAvis = this.dossierService.getAvis();
    this.filteredAvis = GeneriqueListValeur.filtringList(this.listAvis, this.avisControl, this.avisValidatorKey, minSearchLength, 'listValeur');
    //  }, this.dossierService.delay);

    this.updateFormData(this.dossierService.dossier);
    this.setControlListenners();

    if (this.viewAdministratif || this.viewRight) {
      this.formAvisAttribution.disable();
    }
  }

  /**
   * Manages how a avis should be displayed in the input
   * @param avis a given avis to be formatted
   */
  displayAvis(avis: Avis): string | undefined {
    if (avis) {
      return `${avis.code} - ${avis.libelle}`;
    }
  }

  /**
  * Add line on key Enter
  * @param $event event
  * @param oField textAreaText
  * TODO : Add event type
  */
  addLine($event: any, oField: any) {
    this.motifAvisControl.setValue(AlphanumericUtils.addLine($event, oField));
  }

  /**
   * Patches the values from the service in the form
   */
  updateFormData(dossier: Dossier) {
    if (dossier != null && this.formAvisAttribution != null) {      
      this.dossierAdmin = dossier.dossierAdmin;
      this.formAvisAttribution.patchValue({
        avis: dossier.avis,
        motifAvis: dossier.motifAvis,
        numeroAttributif: dossier.dossierAdmin ? dossier.dossierAdmin.numeroAttributif : null
      },
        { emitEvent: false });
    }
  }
  displayMessage(verification: Verification): string {
    let text1 = 'Vérifié par ';
    if (verification.role == 'DDG') {
      text1 = 'Signé par '
    }
    const text2 = ' en tant que ';
    const text3 = ' le '
    return text1 + verification.login + text2 + verification.role + text3 + new Date(verification.dateVerif).toLocaleDateString();
  }

  setControlListenners() {
    if (!this.viewAdministratif) {
      if (this.avisControl.value && this.avisControl.value.libelle === 'Favorable') {
        this.motifAvisControl.setValue(null);
        this.motifAvisControl.disable()
      }
      this.avisControl.valueChanges
        .subscribe((avis) => {
          if (avis && avis.libelle !== 'Favorable') {
            setTimeout(() => {
              this.motif.nativeElement.focus();
            }, 50);
            if (this.motifAvisControl.value === null || this.motifAvisControl.value === '') {
              this.motifAvisControl.setErrors({ 'emptyJustif': true });
            }

          }
          if (avis && avis.libelle === 'Favorable') {
            this.motifAvisControl.setValue(null);
            this.motifAvisControl.disable();
          } else if (avis) {
            this.motifAvisControl.enable()
          }
          this.notifyParentComponent();
        });
      this.motifAvisControl.valueChanges.pipe(takeUntil(this.unsubscribe))
        .subscribe((motif) => {
          if (motif === '' && this.avisControl.value.libelle !== 'Favorable') {
            this.motifAvisControl.setErrors({ 'emptyJustif': true });
          }
          this.notifyParentComponent();
        });
    }
  }

  /**
   * Sends back the updated form to the parent component to manage validation
  */
  notifyParentComponent() {
    this.onAvisAttributionFormChange.emit(this.formAvisAttribution);
  }
}
