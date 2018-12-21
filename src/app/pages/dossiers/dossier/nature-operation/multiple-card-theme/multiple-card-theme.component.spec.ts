import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'app/theme/material/material.module';

import { MultipleCardThemeComponent } from './multiple-card-theme.component';


import { DossierService } from '../../../dossiers.service';
import { DossierServiceStub } from '../../../dossiers.service.spec';
import { Theme } from '../../dossier.interface';

describe('Unit tests of MultipleCardThemeComponent', () => {
  let componentInstance: MultipleCardThemeComponent;
  let fixture: ComponentFixture<MultipleCardThemeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MaterialModule,
        FlexLayoutModule,
        RouterTestingModule
      ],
      declarations: [
        MultipleCardThemeComponent
      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    });

    fixture = TestBed.createComponent(MultipleCardThemeComponent);
    componentInstance = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(componentInstance).toBeTruthy();
  });

  it('should have a valid form by default', () => {
    expect(componentInstance.formThemes.valid).toBeTruthy();
  });

  it('should manage valid theme field value', () => {
    const form = componentInstance.formThemes;
    const themeControl = componentInstance.themesControl;

    expect(themeControl.errors).toBeNull();
    expect(form.valid).toBeTruthy();

    const themeInvalidValue: Theme[] = [{ id: 1, code: 'INVA', libelle: 'PLan d actions' }];
    themeControl.setValue(themeInvalidValue);

    expect(form.valid).toBeTruthy();
  });

  it('should emit the formThemes when some data is updated', () => {
    const form = componentInstance.formThemes;
    const themeControl = componentInstance.themesControl;

    const spyNotifyParent = spyOn(componentInstance, 'notifyParentComponent').and.callThrough();
    expect(spyNotifyParent.calls.any()).toBe(false);

    componentInstance.onThemesFormChange
      .subscribe((outputValue: FormGroup) => {
        expect(outputValue).toBe(form);
        expect(outputValue.valid).toBeTruthy();
      });

    const themeControlValue: Theme[] = [{ id: 1, code: 'INVA', libelle: 'PLan d actions' }];
    themeControl.setValue(themeControlValue);
    expect(themeControl.errors).toBeNull();
    expect(spyNotifyParent.calls.count()).toBe(1);
  });
});
