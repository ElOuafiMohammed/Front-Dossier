import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ComponentViewRightMode, DossierService } from 'app/pages/dossiers/dossiers.service';
import { sigaTrackById } from 'app/shared/tracked-by-id-numero';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Operation, Theme } from '../../dossier.interface';


/**
 * Component that update SIGA dossiers
 */
@Component({
  selector: 'siga-multiple-card-theme',
  templateUrl: './multiple-card-theme.component.html',
  styleUrls: ['./multiple-card-theme.component.scss'],
})

export class MultipleCardThemeComponent extends ComponentViewRightMode implements OnInit, OnChanges, OnDestroy {

  private unsubscribe = new Subject<void>();
  /**
   * The object reprensenting the first part of the dispositif partenariat to be updated
   */
  formThemes: FormGroup;
  /**
   * Thematique List
   */
  themes: Theme[] = null;

  @Input() operation: Operation;
  @Output() onThemesFormChange: EventEmitter<FormGroup> = new EventEmitter();

  /**
   * La fonction trackById pour la ngFor
   */
  trackById = sigaTrackById;

  get themesControl() { return this.formThemes.get('themes'); }
  phaseSubscription: Subscription = null;

  constructor(
    public _dossierService: DossierService,
    private _formBuilder: FormBuilder,
  ) {
    super(_dossierService);

  }

  /**
   * Initializes the form and the specific inputs
   */
  ngOnInit() {
    this.formThemes = this._formBuilder.group({
      themes: ['']
    }, {}
    );
    //  setTimeout(() => {
    this.themes = this._dossierService.getTheme();
    //  }, this._dossierService.delay);

    this.updateFormData();
    this.setControlListenners();
  }

  ngOnChanges() {
    this.updateFormData();
  }

  setControlListenners() {
    this.themesControl.valueChanges.pipe(takeUntil(this.unsubscribe))
      .subscribe((themes: Theme[]) => {
        this.notifyParentComponent();
      })
  }

  /**
   * Sends back the updated form to the parent component to manage validation
  */
  notifyParentComponent() {
    this.onThemesFormChange.emit(this.formThemes);
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
    if (this.operation != null && this.formThemes != null) {
      this.formThemes.patchValue({
        themes: this.operation.themes
      }, { emitEvent: false });
    }
  }

  onDeleteEvent(event) {
    const newThemeList: Theme[] = this.formThemes.get('themes').value.filter((theme) => {
      if (event.id !== theme.id) {
        return theme;
      }
    });
    this.formThemes.get('themes').setValue(newThemeList);
  }

  ngOnDestroy() {
    if (this.phaseSubscription) {
      this.phaseSubscription.unsubscribe();
    }
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
