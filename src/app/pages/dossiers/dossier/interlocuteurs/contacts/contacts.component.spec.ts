import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContactsComponent } from './contacts.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'app/theme/material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { DossierServiceStub } from 'app/pages/dossiers/dossiers.service.spec';
import { HttpClient } from '@angular/common/http';
import { QualiteContact } from '../../dossier.interface';

describe('ContactsComponent', () => {
  let component: ContactsComponent;
  let fixture: ComponentFixture<ContactsComponent>;
  let dossierService: DossierService;

  const listQualiteContact = [{
    id: 1,
    libelle: 'string',
    code: 'string',
    codeParam: 'string',

  }]
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        CommonModule,
        MaterialModule,
        FlexLayoutModule,
        MatInputModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      declarations: [ContactsComponent],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: HttpClient, HttpTestingController }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    dossierService = fixture.debugElement.injector.get(DossierService);

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should manage an valid Nom Prenom field value', () => {
    const form = component.formCorrespondant;
    const nomControl = component.nomControl;

    const nomValidValue = 'UTILISATEUR X';
    nomControl.setValue(nomValidValue);

    expect(nomControl.valid).toBeTruthy();
    expect(form.valid).toBeTruthy();
  });

  it('should manage an invalid Qualite field value', () => {
    const form = component.formCorrespondant;
    const qualiteControl = component.qualiteControl;
    const qualiteValidatorKey = component.qualiteValidatorKey;

    const qualiteInvalidValue: QualiteContact = { id: 0, code: 'INVA', libelle: 'Invalid thématique' };
    qualiteControl.setValue(qualiteInvalidValue);
    component.updateQualite(qualiteInvalidValue);

    expect(qualiteControl.hasError(qualiteValidatorKey)).toBeFalsy();
    expect(form.valid).toBeTruthy();
  });

  it('should manage an invalid Numero telephone field value', () => {
    const form = component.formCorrespondant;
    const numeroTelControl = component.numeroTelControl;
    component.ngOnInit()

    const benefNumberInvalidValue = '12345678';
    numeroTelControl.setValue(benefNumberInvalidValue);
    component.updateNumeroTel(benefNumberInvalidValue);

    expect(numeroTelControl.errors.pattern).toBeTruthy('should have `pattern` error (1)');
    expect(form.valid).toBeFalsy();

    const benefNumbervalidValue = '0642780354';
    numeroTelControl.setValue(benefNumbervalidValue);
    component.updateNumeroTel(benefNumbervalidValue);
    expect(form.valid).toBeTruthy();
  });

  it('should manage an invalid Mail field value', () => {
    const form = component.formCorrespondant;
    const mailControl = component.mailControl;
    component.ngOnInit()

    const mailInvalidValue = 'test.test@stt';
    mailControl.setValue(mailInvalidValue);
    component.updateMail(mailInvalidValue);

    expect(mailControl.errors.pattern).toBeTruthy('should have `pattern` error (1)');
    expect(form.valid).toBeFalsy();

    const mailvalidValue = 'hasna.harroudi@gmail.com';
    mailControl.setValue(mailvalidValue);
    component.updateMail(mailvalidValue);
    expect(form.valid).toBeTruthy();
  });
});
