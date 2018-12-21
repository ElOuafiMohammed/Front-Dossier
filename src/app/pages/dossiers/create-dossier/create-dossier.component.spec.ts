import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'app/theme/material/material.module';

import { CreateDossierComponent } from './create-dossier.component';

import { Thematique } from './create-dossier.interface'

import { DossierService } from '../dossiers.service';
import { DossierServiceStub } from '../dossiers.service.spec';
import { Departements } from '../dossiers.interface';
import { SpinnerLuncher } from '../../../shared/methodes-generiques';
import { SpinnerLuncherStub } from '../../../shared/test.helper';

describe('Unit tests of CreateDossierComponent', () => {
  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };
  let componentInstance: CreateDossierComponent;
  let fixture: ComponentFixture<CreateDossierComponent>;
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
        CreateDossierComponent
      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: Router, useValue: mockRouter },
        { provide: SpinnerLuncher, useClass: SpinnerLuncherStub }
      ]
    });

    fixture = TestBed.createComponent(CreateDossierComponent);
    componentInstance = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(componentInstance).toBeTruthy();
  });

  it('should have an invalid form by default (empty)', () => {
    expect(componentInstance.formDossier.valid).toBeFalsy();
  });


  it('should get Depts', () => {
    dossierService = fixture.debugElement.injector.get(DossierService);
    const spyGetDepts = spyOn(dossierService, 'getDepartements').and.callThrough();
    expect(spyGetDepts.calls.count()).toBe(0);

    componentInstance.ngOnInit();

    expect(spyGetDepts.calls.count()).toBe(1);
  });

  it('should manage an invalid Thematique field value', () => {
    const form = componentInstance.formDossier;
    const thematiqueControl = componentInstance.thematiqueControl;
    expect(thematiqueControl.errors['required']).toBeTruthy();

    const thematiqueInvalidValue: Thematique = { id: 0, code: 'INVA', libelle: 'Invalid thématique' };
    thematiqueControl.setValue(thematiqueInvalidValue);
    expect(form.valid).toBeFalsy();
  });

  it('should manage an invalid Departement field value', () => {
    const form = componentInstance.formDossier;
    const deptControl = componentInstance.deptControl;
    const deptValidatorKey = componentInstance.deptValidatorKey;

    expect(deptControl.errors['required']).toBeTruthy();

    const deptInvalidValue: Departements = { id: 0, numero: '', nomDept: 'Département inconnu' };
    deptControl.setValue(deptInvalidValue);

    expect(deptControl.errors[deptValidatorKey]).toBeTruthy();
    expect(form.valid).toBeFalsy();
  });

  it('should manage an invalid Intitule field value', () => {
    const form = componentInstance.formDossier;
    const intituleControl = componentInstance.intituleControl;

    expect(intituleControl.errors['required']).toBeTruthy();

    const intituleInvalidValue = '01234567890123456789012345678901234567890123456789012345678901234567890123456789e';
    intituleControl.setValue(intituleInvalidValue);

    expect(intituleControl.errors['maxlength']).toBeTruthy();
    expect(form.valid).toBeFalsy();
  });

  it('should manage an invalid Numero Beneficiaire field value', () => {
    const form = componentInstance.formDossier;
    const benefNumberControl = componentInstance.benefNumberControl;
    let benefNumberInvalidValue = null;

    expect(benefNumberControl.errors['required']).toBeTruthy();

    benefNumberInvalidValue = '12345678ee';
    benefNumberControl.setValue(benefNumberInvalidValue);

    expect(benefNumberControl.errors['maxlength']).toBeTruthy('should have `maxlength` error');
    expect(benefNumberControl.errors['pattern']).toBeTruthy('should have `pattern` error (1)');

    benefNumberInvalidValue = '123456780';
    benefNumberControl.setValue(benefNumberInvalidValue);

    expect(benefNumberControl.errors['pattern']).toBeTruthy();
    expect(form.valid).toBeFalsy();
  });

  it('should manage an invalid Libelle Beneficiaire field value', () => {
    const form = componentInstance.formDossier;
    const benefLibelleControl = componentInstance.benefLibelleControl;

    expect(benefLibelleControl.disabled).toBeTruthy();
    // Disabled field does not triggers require validator
    expect(benefLibelleControl.errors).toBeNull();
    expect(form.valid).toBeFalsy();
  });

  it('should test the link between Numero Beneficiaire and Libelle Beneficiaire fields', () => {
    const benefNumberControl = componentInstance.benefNumberControl;
    const benefLibelleControl = componentInstance.benefLibelleControl;

    dossierService = fixture.debugElement.injector.get(DossierService);

    const benefNumberInvalidValue = '12345678ee';
    benefNumberControl.setValue(benefNumberInvalidValue);
    expect(benefLibelleControl.value).toBeNull();
    expect(benefLibelleControl.disabled).toBeTruthy();

    const benefNumberValidValue = '01234567M';
    benefNumberControl.setValue(benefNumberValidValue);
    expect(benefLibelleControl.value).toBe('raison sociale de 01234567M');
    expect(benefLibelleControl.disabled).toBeTruthy();
  });

  it('should call the createDossier service when the form is valid', () => {
    // const thematique = {
    //   id: 1,
    //   codeParam: 'THEMA',
    //   libelleParam: null,
    //   code: 'AGRI',
    //   libelle: 'Agriculture'
    // }
    // const form = componentInstance.formDossier;
    // const thematiqueControl = componentInstance.thematiqueControl;
    // const deptControl = componentInstance.deptControl;
    // const intituleControl = componentInstance.intituleControl;
    // const benefNumberControl = componentInstance.benefNumberControl;
    // expect(form.valid).toBeFalsy();

    // const thematiqueValidValue: Thematique = thematique
    // thematiqueControl.setValue(thematiqueValidValue);
    // const deptValidValue: Departement = componentInstance.depts[0];
    // deptControl.setValue(deptValidValue);
    // const intituleValue = 'Ceci est un libellé valide';
    // intituleControl.setValue(intituleValue);
    // const benefNumberValue = '01234567M';
    // benefNumberControl.setValue(benefNumberValue);

    // expect(form.valid).toBeTruthy();

    // dossierService = fixture.debugElement.injector.get(DossierService);
    // const spyCreateDossierService = spyOn(dossierService, 'createDossier').and.callThrough();
    // expect(spyCreateDossierService.calls.any()).toBe(false);
  });
});
