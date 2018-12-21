import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Dossier } from 'app/pages/dossiers/dossiers.interface';
import { ComponentViewRightMode, DossierService } from 'app/pages/dossiers/dossiers.service';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DispositionsFinancieres, EncadrementCommJustif } from '../dossier.interface';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'recap-aides',
  templateUrl: './recap-aides.component.html',
  styleUrls: ['./recap-aides.component.scss']
})
export class RecapAidesComponent extends ComponentViewRightMode implements OnInit, OnChanges, OnDestroy {

  @Input() dossier: Dossier;

  private unsubscribe = new Subject<void>();

  /**
   * The object reprensenting the first part of the dispositif partenariat to be updated
   */
  formRecaputilatif: FormGroup;

  /**
   * justifEncadrements List
   */
  justifEncadrements: DispositionsFinancieres[] = null;

  recapChange = false;

  @Output() onRecaputilatifFormChange: EventEmitter<FormGroup> = new EventEmitter();
  @Output() recapDelete: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('myTextArea', { read: ElementRef }) myTextArea: ElementRef;

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  get encadrementControl() { return this.formRecaputilatif.get('encadrementComm'); };
  get justifControl() { return this.formRecaputilatif.get('encadrementJUstif'); }
  readonly justifValidatorKey = 'justifNotFound';
  phaseSubscription: Subscription = null;
  administratifSubscription: Subscription = null;

  constructor(
    public _dossierService: DossierService,
    private _formBuilder: FormBuilder,

  ) {
    super(_dossierService);
    this.formRecaputilatif = this._formBuilder.group({
      encadrementComm: [''],
      encadrementJUstif: [null, []]
    }, {}
    );

    this.phaseSubscription = _dossierService.dossierPhase$
      .subscribe(phase => {
        if ((phase || this.viewAdministratif) && this.formRecaputilatif) {
          this.justifControl.disable({ emitEvent: false });
        }
        if ((!phase || this.viewAdministratif) && this.formRecaputilatif) {
          this.justifControl.enable({ emitEvent: false });
        }
      });
    this.administratifSubscription = _dossierService.dossierAdministratif$
      .subscribe(administratif => {
        if (administratif && this.formRecaputilatif) {
          this.justifControl.disable()
        } else {
          this.justifControl.enable()
        }
      });
  }

  /**
   * Initializes the form and the specific inputs
   */
  ngOnInit() {
    // list of modalitesVersement
    //  setTimeout(() => {
    this.justifEncadrements = this._dossierService.getEncadrementCommJustif();
    // Forces an update for IE if the typologies load too late
    if (this._dossierService.dossier && this._dossierService.dossier.dossierFinancier) {
      this.updateFormData();
    }
    //  }, this._dossierService.delay);

    if (this.viewRight || this.viewAdministratif) {
      this.justifControl.disable();
    } else {
      this.justifControl.enable();

    }
    this.updateFormData();
    this.setControlListenners();
  }

  ngOnChanges() {
    this.updateFormData();
  }

  setControlListenners() {
    this.encadrementControl.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(
      choixEncadrement => {
        if (choixEncadrement === true) {
          this.justifControl.setValidators([Validators.required]);
        } else {
          this.justifControl.setValidators([]);
          this.justifControl.setValue(null);
        }
        this.notifyParentComponent();
        this.justifControl.updateValueAndValidity();
      })
    this.justifControl.valueChanges
      .subscribe((justifs: EncadrementCommJustif[]) => {
        this.notifyParentComponent();
      })
  }

  /**
   * Sends back the updated form to the parent component to manage validation
  */
  notifyParentComponent() {
    this.onRecaputilatifFormChange.emit(this.formRecaputilatif);
  }

  /**
   * Manages how a priorite should be displayed in the input
   * @param priorite a given NiveauPriorite to be formatted
   */
  displaySession(justif: DispositionsFinancieres) {
    if (justif) {
      return `${justif.libelle}`;
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

  /**
   * Patches the values from the service in the form
   */
  updateFormData() {
    if (this.dossier != null && this.formRecaputilatif != null) {
      // Manage radio-button value reference manually
      this.formRecaputilatif.patchValue({
        encadrementComm: this.dossier.dossierFinancier.encadrementComm,
        encadrementJUstif: this.dossier.dossierFinancier.encadrementCommJustifs,
      });
    }
  }

  onDeleteEventEncadrement(event) {
    const newEncadrementList: EncadrementCommJustif[] = this.justifControl.value.filter((jutif) => {
      if (event.id !== jutif.id) {
        return jutif;
      }
    });
    this.justifControl.setValue(newEncadrementList);
    this.recapDelete.emit(true);
  }

  /**
  * Destroys pending subscriptions
  */
  ngOnDestroy() {
    if (this.phaseSubscription) {
      this.phaseSubscription.unsubscribe();
    }
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
