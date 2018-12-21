import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DescriptionGeneraleComponent } from './description-generale.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MaterialModule } from '../../../../theme/material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterTestingModule } from '@angular/router/testing';
import { DossierServiceStub } from '../../dossiers.service.spec';
import { DossierService } from '../../dossiers.service';
import { By } from '@angular/platform-browser';
import { MatSlideToggle, MatRadioChange, MatSlideToggleBase, MatSlideToggleChange } from '@angular/material';
import { TranslateModule, TranslatePipe, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { AccueilService } from '../../accueil/accueil.service';
import { AccueilServiceStub } from '../../accueil/accueil.service.spec';
import { ModalitesVersement, ModalitesReduction, DispositionsFinancieres, EngagementsParticuliers, SldNonStandard } from '../dossier.interface';
import { SpinnerLuncher } from '../../../../shared/methodes-generiques';
import { SpinnerLuncherStub } from '../../../../shared/test.helper';

describe('DescriptionGeneraleComponent', () => {
  let component: DescriptionGeneraleComponent;
  let fixture: ComponentFixture<DescriptionGeneraleComponent>;
  let slideToggle: MatSlideToggle;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MaterialModule,
        FlexLayoutModule,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      declarations: [DescriptionGeneraleComponent],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        { provide: TranslateService, useValue: TranslatePipe },
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: AccueilService, useClass: AccueilServiceStub },
        { provide: SpinnerLuncher, useClass: SpinnerLuncherStub },
        DatePipe
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DescriptionGeneraleComponent);
    component = fixture.componentInstance;
    const slideToggleDebug = fixture.debugElement.query(By.css('mat-slide-toggle'));
    slideToggle = slideToggleDebug.componentInstance;
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should manage valid  fields value', () => {
    const form = component.formDescription;
    const justifDerogationControl = component.justifDerogationControl;
    const margeAvenirJustifControl = component.margeAvenirJustifControl;

    expect(justifDerogationControl.errors).toBeNull();
    expect(margeAvenirJustifControl.errors).toBeNull();
    expect(form.valid).toBeTruthy();

    expect(form.valid).toBeTruthy();
  });

  it('should correctly update the disabled property', () => {
    expect(slideToggle.checked).toBeFalsy();
    expect(slideToggle.disabled).toBeFalsy();

    slideToggle.setDisabledState(true);
    expect(slideToggle.disabled).toBeTruthy();

    slideToggle.setDisabledState(false);
    expect(slideToggle.disabled).toBeFalsy();

  });

  it('should set the toggle to checked on interaction', () => {
    expect(slideToggle.checked).toBeFalsy();

    slideToggle.checked = true;
    expect(slideToggle.checked).toBeTruthy();

    slideToggle.checked = false;
    expect(slideToggle.checked).toBeFalsy();

  });

  it('should set empty textarea when toggle is checked ', () => {
    const justifDerogationControl = component.justifDerogationControl;

    slideToggle.checked = true;
    expect(justifDerogationControl.value).toEqual('');

    slideToggle.checked = false;
    expect(justifDerogationControl.value).toEqual('');

  });

  it('should set empty margeAvenir textarea when toggle is checked ', () => {
    const margeAvenirJustifControl = component.margeAvenirJustifControl;

    slideToggle.checked = true;
    expect(margeAvenirJustifControl.value).toEqual('');

    slideToggle.checked = false;
    expect(margeAvenirJustifControl.value).toEqual('');

  });

  it('should emit the formDescription when some data is updated', () => {
    const form = component.formDescription;
    const derogationControl = component.derogationControl;
    const margeAvenirControl = component.margeAvenirControl;
    const dispositionsControl = component.dispositionsControl;
    const engagementsControl = component.engagementsControl;
    const justifDerogationControl = component.justifDerogationControl;
    const typDocAttribControl = component.typDocAttribControl;
    const formDocAttribControl = component.formDocAttribControl;


    const spyNotifyParent = spyOn(component, 'notifyParentComponent').and.callThrough();
    expect(spyNotifyParent.calls.any()).toBe(false);

    component.onDescriptionFormChange
      .subscribe((outputValue: FormGroup) => {
        expect(outputValue).toBe(form);
        expect(outputValue.valid).toBeTruthy();
      });

    const fakeToggleSilderChangeEvent = new MatSlideToggleChange(null, true);
    derogationControl.setValue(fakeToggleSilderChangeEvent);
    expect(spyNotifyParent.calls).toBeTruthy();


    const fakeToggleSilderChangeEventForMarge = new MatSlideToggleChange(null, true);
    margeAvenirControl.setValue(fakeToggleSilderChangeEventForMarge);
    expect(spyNotifyParent.calls.count()).toBeDefined();

    expect(spyNotifyParent).toBeDefined();

    justifDerogationControl.setValue('justification de la dérogation')
    expect(spyNotifyParent.calls.count()).toBeDefined();
    typDocAttribControl.setValue(true);
    expect(spyNotifyParent.calls.count()).toBeDefined();
    formDocAttribControl.setValue(true);
    expect(spyNotifyParent.calls.count()).toBeDefined();


    const engagementInvalidValue: EngagementsParticuliers[] = [{ id: 1, code: 'INVA', libelle: 'PLan d actions', texte: 'text1' }];
    engagementsControl.setValue(engagementInvalidValue);
    expect(engagementsControl.errors).toBeNull();
    expect(spyNotifyParent.calls.count()).toBeDefined();
    dispositionsControl.setValue(engagementInvalidValue);
    expect(dispositionsControl.errors).toBeNull();

    expect(spyNotifyParent.calls).toBeTruthy();
  });

  it('should create a document : descriptif technique ', () => {
    component.createDescreptifTech();
    expect(component.canCreateDescTech).toBe(false);
  });

  it('should manage valid engagement field value', () => {
    const form = component.formDescription;
    const engagementsControl = component.engagementsControl;

    expect(engagementsControl.errors).toBeNull();
    expect(form.valid).toBeTruthy();

    const engagementInvalidValue: EngagementsParticuliers[] = [{ id: 1, code: 'INVA', libelle: 'PLan d actions', texte: 'text1' }];
    engagementsControl.setValue(engagementInvalidValue);

    expect(form.valid).toBeTruthy();
  });

  it('should manage valid disposition field value', () => {
    const form = component.formDescription;
    const dispositionsControl = component.dispositionsControl;

    expect(dispositionsControl.errors).toBeNull();
    expect(form.valid).toBeTruthy();

    const dispositionInvalidValue: DispositionsFinancieres[] = [{ id: 1, code: 'INVA', libelle: 'PLan d actions', texte: 'text1' }];
    dispositionsControl.setValue(dispositionInvalidValue);

    expect(form.valid).toBeTruthy();
  });

  it('should manage valid soldenonstandard', () => {
    const form = component.formDescription;
    const sldsNonStandardControl = component.sldsNonStandardControl;

    expect(sldsNonStandardControl.errors).toBeNull();
    expect(form.valid).toBeTruthy();

    const soldesNonStandard: SldNonStandard[] = [{ id: 1, libelle: 'INVANAVNI' }, { id: 2, libelle: 'AZERTYTREZA' }, { id: 3, libelle: 'WXCVBVCXW' }];
    sldsNonStandardControl.setValue(soldesNonStandard);

    expect(form.valid).toBeTruthy();
  });

  it('should manage valid modalites de reduction field value', () => {
    const form = component.formDescription;
    const modalitesReductionControl = component.modalitesReductionControl;

    expect(modalitesReductionControl.errors).toBeNull();
    expect(form.valid).toBeTruthy();

    const modaliteInvalidValue: ModalitesReduction[] = [{ id: 1, code: 'INVA', libelle: 'PLan d actions', texte: 'text1', codeParam: '', libelleParam: '', noOrdre: null }];
    modalitesReductionControl.setValue(modaliteInvalidValue);

    expect(form.valid).toBeTruthy();
  });

  it('should manage valid modalites de versement field value', () => {
    const form = component.formDescription;
    const modalitesVersementControl = component.modalitesVersementControl;

    expect(modalitesVersementControl.errors).toBeNull();
    expect(form.valid).toBeTruthy();

    const modaliteInvalidValue: ModalitesVersement = { id: 1, code: 'STD', libelle: 'Standards', texte: 'text1', codeParam: '', libelleParam: '', noOrdre: null };
    modalitesVersementControl.setValue(modaliteInvalidValue);
    expect(form.valid).toBeTruthy();
  });

  it('should manage valid delai de validité field value', () => {
    const form = component.formDescription;
    const delaiValiditeControl = component.delaiValiditeControl;

    expect(delaiValiditeControl.errors).toBeNull();
    expect(form.valid).toBeTruthy();

    const modaliteInvalidValue = 15;
    delaiValiditeControl.setValue(modaliteInvalidValue);
    component.setControlListenners();
    expect(form.valid).toBeTruthy();
  });

});
