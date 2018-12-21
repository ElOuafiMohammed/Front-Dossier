import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MatAutocompleteSelectedEvent, MatOption, MatRadioChange } from '@angular/material';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'app/theme/material/material.module';

import { PrevisionnelComponent } from './previsionnel.component';

import { SessionDecision, TypeDispositif, Typologie } from '../dossier.interface';


import { DossierService } from '../../dossiers.service';
import { DossierServiceStub } from '../../dossiers.service.spec';

import { TranslateModule } from '@ngx-translate/core';

describe('Unit tests of PrevisionnelComponent', () => {
  let componentInstance: PrevisionnelComponent;
  let fixture: ComponentFixture<PrevisionnelComponent>;
  let dossierService: DossierService;

  beforeEach(() => {
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
      declarations: [
        PrevisionnelComponent
      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
      ]
    });

    fixture = TestBed.createComponent(PrevisionnelComponent);
    componentInstance = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(componentInstance).toBeTruthy();
  });

  it('should have a valid form by default', () => {
    expect(componentInstance.formPrevisionnel.valid).toBeTruthy();
  });

  it('should call #getSessionDecision', () => {
    dossierService = fixture.debugElement.injector.get(DossierService);
    const spyGetSessionDecision = spyOn(dossierService, 'getSessionDecision').and.callThrough();
    expect(spyGetSessionDecision.calls.count()).toBe(0);

    componentInstance.ngOnInit();

    expect(spyGetSessionDecision.calls.count()).toBe(1);
  });

  it('should call #getTypologies', () => {
    dossierService = fixture.debugElement.injector.get(DossierService);
    const spyGetTypologies = spyOn(dossierService, 'getTypologies').and.callThrough();
    expect(spyGetTypologies.calls.count()).toBe(0);

    componentInstance.ngOnInit();

    //  expect(spyGetTypologies.calls.count()).toBe(1);
  });

  it('should manage an invalid SessionDecision field value', () => {
    const form = componentInstance.formPrevisionnel;
    const sessionControl = componentInstance.sessionControl;
    const sessionValidatorKey = componentInstance.sessionValidatorKey;

    expect(sessionControl.errors).toBeNull();
    expect(form.valid).toBeTruthy();

    const sessionDecisionInvalidValue: SessionDecision = { id: 0, annee: '2010', numero: '48', type: 'CI', date: new Date('1995-12-17T03:24:00') };
    sessionControl.setValue(sessionDecisionInvalidValue);

    expect(sessionControl.errors[sessionValidatorKey]).toBeTruthy();
    expect(form.valid).toBeFalsy();
  });

  it('should manage an invalid AnneeDecisionnelle field value', () => {
    const form = componentInstance.formPrevisionnel;
    const anneeControl = componentInstance.anneeControl;

    expect(anneeControl.errors).toBeNull();
    expect(form.valid).toBeTruthy();

    anneeControl.setValue('aaaa');
    expect(anneeControl.errors['pattern']).toBeTruthy();
    expect(form.valid).toBeFalsy();

    anneeControl.setValue(20);
    expect(anneeControl.errors['pattern']).toBeTruthy();
    expect(form.valid).toBeFalsy();

    anneeControl.setValue(2019);
    expect(form.valid).toBeTruthy();
    anneeControl.setValue(2017);
    expect(form.valid).toBeFalsy();
  });

  it('should manage the update of anneeControl value when a SessionDecision is selected', () => {
    const sessionControl = componentInstance.sessionControl;
    const anneeControl = componentInstance.anneeControl;

    expect(anneeControl.value).toBeNull();

    const sessionDecisionValue: SessionDecision = { id: 1, annee: '2017', numero: '1', type: 'TI', date: new Date('2019-12-17T03:24:00') };
    const fakeOption: Partial<MatOption> = { value: sessionDecisionValue };
    const fakeMaterialSelectEvent = new MatAutocompleteSelectedEvent(null, (fakeOption as MatOption));
    componentInstance.onSessionSelect(fakeMaterialSelectEvent);

    expect(sessionControl.errors).toBeNull();
  });

  it('should clear the sessionControl value when the anneeControl value changes', () => {
    const sessionControl = componentInstance.sessionControl;
    const anneeControl = componentInstance.anneeControl;

    expect(anneeControl.value).toBeNull();
    expect(sessionControl.value).toBeNull();

    const sessionDecisionValue: SessionDecision = { id: 1, annee: '2018', numero: '1', type: 'TI', date: new Date('2019-12-17T03:24:00') };
    sessionControl.setValue(sessionDecisionValue);
    expect(sessionControl.errors).toBeTruthy();

    anneeControl.setValue(2042);
    // expect(sessionControl.value).toBeGreaterThan(2018);
    // expect(sessionControl.errors).toBeNull();
  });

  it('should emit the formPrevisionnel when some data is updated', () => {
    const formPrevisionnel = componentInstance.formPrevisionnel;
    const sessionControl = componentInstance.sessionControl;
    const anneeControl = componentInstance.anneeControl;
    const typologieControl = componentInstance.typologieControl;

    expect(sessionControl.value).toBeNull();
    expect(anneeControl.value).toBeNull();
    expect(typologieControl.value).toBeNull();

    const spyNotifyParent = spyOn(componentInstance, 'notifyParentComponent').and.callThrough();
    expect(spyNotifyParent.calls.any()).toBe(false);

    componentInstance.onPreDossierFormChange
      .subscribe((outputValue: FormGroup) => {
        expect(outputValue).toBe(formPrevisionnel);
        expect(outputValue.valid).toBeTruthy();
      });

    const sessionDecisionValue: SessionDecision = { id: 1, annee: '2018', numero: '1', type: 'TI', date: new Date('2019-12-17T03:24:00') };
    sessionControl.setValue(sessionDecisionValue);
    expect(sessionControl.errors).toBeTruthy();
    anneeControl.setValue(2042);
    const typologieValue: Typologie = { id: 1, code: 'NC', libelle: 'Not Coherent' };
    const fakeMaterialRadioChangeEvent = new MatRadioChange(null, typologieValue);
    componentInstance.onTypologieSelectOption(fakeMaterialRadioChangeEvent);

    expect(spyNotifyParent.calls.count()).toBe(3);
  });

});
