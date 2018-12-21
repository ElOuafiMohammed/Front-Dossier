import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';
import { Subscription } from 'rxjs/Subscription';

import { NgaModule } from 'app/theme/nga.module';

import { ResponsableTechnique } from '../../create-dossier/create-dossier.interface';

import { CritereCardComponent } from './criteres-card.component';

import { DossierService } from '../../dossiers.service';
import { DossierServiceStub } from '../../dossiers.service.spec';

import { TranslateModule } from '@ngx-translate/core';
import { Departements } from '../../dossiers.interface';
import { SpinnerLuncher } from '../../../../shared/methodes-generiques';
import { SpinnerLuncherStub } from '../../../../shared/test.helper';

describe('CritereCardComponent', () => {

  let componentInstance: CritereCardComponent;
  let fixture: ComponentFixture<CritereCardComponent>;
  let dossierService: DossierService;

  describe('unit tests => ', () => {

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          BrowserAnimationsModule,
          NgaModule.forRoot(),
          TranslateModule.forRoot()
        ],
        declarations: [
          CritereCardComponent
        ],
        schemas: [
          NO_ERRORS_SCHEMA
        ],
        providers: [
          { provide: DossierService, useClass: DossierServiceStub },
          { provide: SpinnerLuncher, useClass: SpinnerLuncherStub }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(CritereCardComponent);
      componentInstance = fixture.componentInstance;
      fixture.detectChanges();
      dossierService = fixture.debugElement.injector.get(DossierService);
    });

    it('should create component', () => {
      expect(componentInstance).toBeTruthy();
    });

    it('should have an invalid form by default (empty)', () => {
      expect(componentInstance.formCritere.valid).toBeFalsy();
    });

    it('should manage an invalid Departement field value', () => {
      const form = componentInstance.formCritere;
      const deptControl = componentInstance.deptControl;
      const deptValidatorKey = componentInstance.deptValidatorKey;
      dossierService.getDepartements()
        .subscribe(
          (data) => {
            componentInstance.depts = data;
          })

      componentInstance.ngOnChanges();
      const deptInvalidValue: Departements = { id: 0, numero: '', nomDept: 'Département inconnu' };
      deptControl.setValue(deptInvalidValue);

      expect(deptControl.errors[deptValidatorKey]).toBeTruthy();
      expect(form.valid).toBeFalsy();
    });

    it('should manage an invalid numeroIncrement field value', () => {
      const form = componentInstance.formCritere;
      const numeroIncrementControl = componentInstance.numeroIncrementControl;
      let incNumInvalidValue = null;
      componentInstance.ngOnChanges();
      incNumInvalidValue = '0123';
      numeroIncrementControl.setValue(incNumInvalidValue);

      expect(numeroIncrementControl.errors['pattern']).toBeTruthy();
      expect(form.valid).toBeFalsy();
    });

    it('should manage an invalid Numero Beneficiaire field value', () => {
      const form = componentInstance.formCritere;
      const benefNumberControl = componentInstance.benefNumberControl;
      let benefNumberInvalidValue = null;
      componentInstance.ngOnChanges();

      benefNumberInvalidValue = '12345678ee';
      benefNumberControl.setValue(benefNumberInvalidValue);

      expect(benefNumberControl.errors['maxlength']).toBeTruthy();
      expect(benefNumberControl.errors['pattern']).toBeTruthy();

      benefNumberInvalidValue = '123456780';
      benefNumberControl.setValue(benefNumberInvalidValue);

      expect(benefNumberControl.errors['maxlength']).toBeFalsy();
      expect(benefNumberControl.errors['pattern']).toBeTruthy();
      expect(form.valid).toBeFalsy();
    });

    it('should manage an invalid Libelle Beneficiaire field value', () => {
      const form = componentInstance.formCritere;
      const benefLibelleControl = componentInstance.benefLibelleControl;

      expect(benefLibelleControl.disabled).toBeTruthy();
      expect(benefLibelleControl.errors).toBeNull();
      expect(form.valid).toBeFalsy();
    });

    it('should test the link between Numero Beneficiaire and Libelle Beneficiaire fields', () => {
      const benefNumberControl = componentInstance.benefNumberControl;
      const benefLibelleControl = componentInstance.benefLibelleControl;

      const benefNumberInvalidValue = '12345678ee';
      benefNumberControl.setValue(benefNumberInvalidValue);
      expect(benefLibelleControl.value).toBe('');
      expect(benefLibelleControl.disabled).toBeTruthy();

      const benefNumberValidValue = '01234567M';
      benefNumberControl.setValue(benefNumberValidValue);
      expect(benefLibelleControl.value).toBe('raison sociale de 01234567M');
      expect(benefLibelleControl.disabled).toBeTruthy();
    });

    it('should manage an invalid Responsable Technique field value', () => {
      const form = componentInstance.formCritere;
      const respTechControl = componentInstance.respTechControl;
      const respTechValidatorKey = componentInstance.respTechValidatorKey;
      dossierService.getResponsableTech().subscribe(
        (data) => {
          componentInstance.responsablesTech = data;
        })
      componentInstance.ngOnChanges();

      const responsableTechInvalidValue: ResponsableTechnique = {
        login: '',
        prenom: 'INVA',
        nom: 'Invalid responsalbe technique',
        email: null,
        telephone: null,
        organisation: null
      };
      respTechControl.setValue(responsableTechInvalidValue);

      expect(respTechControl.errors[respTechValidatorKey]).toBeTruthy();
      expect(form.valid).toBeFalsy();
    });


    it('onSubmit should return emmit the proper object', () => {
      spyOn(componentInstance.searchEventEmitter, 'emit');
      componentInstance.onSubmit();
      expect(componentInstance.searchEventEmitter.emit).toHaveBeenCalledWith({
        thematique: null,
        departement: null,
        responsableTech: null,
        numeroIncrement: null,
        codeBenef: null,
        phase: null,
      });
    });

  });
});
