import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';

import { MomentDateAdapter } from '@angular/material-moment-adapter';

import { DossierServiceStub } from '../../dossiers.service.spec';
import { NgaModule } from 'app/theme/nga.module';
import { CriteresAttribuerAideComponent } from './criteres-attribuer-aide.component';
import { DossierService } from '../../dossiers.service';
import { Thematique } from '../../create-dossier/create-dossier.interface';
import { MY_FORMATS } from 'app/app.module';
import { SpinnerLuncher } from '../../../../shared/methodes-generiques';
import { SpinnerLuncherStub } from '../../../../shared/test.helper';

describe('CriteresAttribuerAideComponent', () => {
  let component: CriteresAttribuerAideComponent;
  let fixture: ComponentFixture<CriteresAttribuerAideComponent>;
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
          CriteresAttribuerAideComponent,
        ],
        schemas: [
          NO_ERRORS_SCHEMA
        ],
        providers: [
          { provide: DossierService, useClass: DossierServiceStub }, DatePipe,
          { provide: MAT_DATE_LOCALE, useValue: 'fr' },
          { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
          { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
          { provide: SpinnerLuncher, useClass: SpinnerLuncherStub }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(CriteresAttribuerAideComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      dossierService = fixture.debugElement.injector.get(DossierService);
    });

    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should have an invalid form by default (empty)', fakeAsync(() => {
      tick(500);
      fixture.detectChanges();
      expect(component.formCritere.valid).toBeFalsy();
    }));

    it('should manage an invalid Thematique field value', fakeAsync(() => {
      const form = component.formCritere;
      const thematiqueControl = component.thematiqueControl;
      const thematiqueValidatorKey = component.thematiqueValidatorKey;
      component.thematiques = dossierService.getThematiques();

      component.ngOnChanges();
      tick(500);
      const thematiqueInvalidValue: Thematique = { id: 0, code: 'INVA', libelle: 'Invalid thématique' };
      thematiqueControl.setValue(thematiqueInvalidValue);

      expect(thematiqueControl.errors[thematiqueValidatorKey]).toBeTruthy();
      expect(form.valid).toBeFalsy();
    }));


  });
});
