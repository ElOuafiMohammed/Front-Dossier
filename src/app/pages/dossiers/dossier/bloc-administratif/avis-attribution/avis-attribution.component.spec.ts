import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvisAttributionComponent } from './avis-attribution.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MaterialModule } from '../../../../../theme/material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterTestingModule } from '@angular/router/testing';
import { DossierService } from '../../../dossiers.service';
import { DossierServiceStub } from '../../../dossiers.service.spec';
import { Avis } from '../../../create-dossier/create-dossier.interface';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';


describe('AvisAttributionComponent', () => {
  let component: AvisAttributionComponent;
  let fixture: ComponentFixture<AvisAttributionComponent>;
  let pipe: FormatMonetairePipe;


  beforeEach(async(() => {
    pipe = new FormatMonetairePipe();

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
      declarations: [AvisAttributionComponent],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        { provide: TranslateService },
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: FormatMonetairePipe, useValue: pipe },
        DatePipe
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvisAttributionComponent);
    component = fixture.componentInstance;
    // component.dossierService.dossier.dossierAdmin = {
    //   idDossier: 1,
    //   dateAttribution: new Date('1995-12-17T03:24:00'),
    //   numeroAttributif: 'string',
    //   numerosAide: [{
    //     id: 1,
    //     ligne: 'string',
    //     annee: 2018,
    //     formeAide: 'string',
    //     version: 'string',
    //     numeroAide: 'string',
    //     montantAide: 200
    //   }]
    // }
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should manage an valid Avis field value', () => {
    const form = component.formAvisAttribution;
    const avisControl = component.avisControl;
    const avisValidatorKey = component.avisValidatorKey;
    component.listAvis = component.dossierService.getAvis();

    const avisValidValue: Avis = {
      id: 1,
      code: 'fake code',
      libelle: 'fake label',
      codeParam: 'fake code param',
      libelleParam: 'fake label param'
    };
    avisControl.setValue(avisValidValue);

    expect(avisControl.hasError(avisValidatorKey)).toBeFalsy();
    expect(form.valid).toBeTruthy();
  });

  it('should manage an valid motif field value', () => {
    const form = component.formAvisAttribution;
    const motifAvisControl = component.motifAvisControl;

    motifAvisControl.setValue('valid motif');

    expect(motifAvisControl.errors).toBeNull();
    expect(form.valid).toBeTruthy();
  });

  it('should emit the formAvisAttribution when some data is updated', () => {
    const form = component.formAvisAttribution;
    const avisControl = component.avisControl;
    const motifAvisControl = component.motifAvisControl;
    const spyNotifyParent = spyOn(component, 'notifyParentComponent').and.callThrough();
    expect(spyNotifyParent.calls.any()).toBe(false);

    component.onAvisAttributionFormChange
      .subscribe((outputValue: FormGroup) => {
        component.formAvisAttribution = outputValue;
        expect(outputValue).toBe(form);
      });

    const avisValidValue: Avis = { id: 0, code: 'INVA', libelle: 'valid avis' };
    avisControl.setValue(avisValidValue);
    expect(spyNotifyParent.calls.count()).toBe(2);

    motifAvisControl.setValue('motif avis')
    expect(spyNotifyParent.calls.count()).toBe(3);

  });

});
