
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE, MatDatepicker } from '@angular/material';
import { MatMomentDateModule, MomentDateAdapter } from '@angular/material-moment-adapter';

import { MaterialModule } from 'app/theme/material/material.module';

import { InputFinValiditeComponent } from './input-fin-validite.component';
import { TranslateModule, TranslateService, TranslatePipe } from '@ngx-translate/core';

describe('InputFinValiditeComponent', () => {
  let component: InputFinValiditeComponent;
  let fixture: ComponentFixture<InputFinValiditeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatMomentDateModule,
        MaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      declarations: [InputFinValiditeComponent],
      providers: [
        { provide: TranslateService, useValue: TranslatePipe },
        { provide: MAT_DATE_LOCALE, useValue: 'fr' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputFinValiditeComponent);
    component = fixture.componentInstance;
    component.rowData = {
      codeThematique: 'AEEP',
      dateDebutValidite: '1964-12-16T00:00:00.000+0000',
      dateError: false,
      dateFinValidite: '16/02/2018',
      disable: true,
      hasError: false,
      id: 48234,
      libelle: 'Etudes',
      ligne: '230',
      modif: true,
      numero: '01',
      toDelete: false
    }
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the date fin when data is updated', () => {
    fixture.detectChanges();
    const control = component.formNatureOperation.get('dateFinValidite');
    const spyupdateNatureEvent = spyOn(component.updateNatureEvent, 'emit');

    control.setValue(component.rowData.dateFinValidite);

    expect(spyupdateNatureEvent.calls.any()).toBe(true);

    component.setControlDate();
    expect(spyupdateNatureEvent.calls.any()).toBe(true);

  });

  it('should test input date errors', () => {
    fixture.detectChanges();
    const control = component.formNatureOperation.get('dateFinValidite');


    const dateInvalidValue = 'fffff';
    component.setControlDate();
    control.setValue(dateInvalidValue);
    expect(control.errors['matDatepickerParse']).toBeTruthy();

    const dateInvalidValueMin = { _d: new Date(1940, 12, 15), _i: { year: 1940, month: 12, date: 15 } };
    component.setControlDate();
    control.setValue(dateInvalidValueMin);
    expect(control.errors['matDatepickerMin']).toBeTruthy();

  });

});
