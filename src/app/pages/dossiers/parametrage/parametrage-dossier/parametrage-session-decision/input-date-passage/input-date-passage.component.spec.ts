
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE, MatDatepicker } from '@angular/material';
import { MatMomentDateModule, MomentDateAdapter } from '@angular/material-moment-adapter';

import { MaterialModule } from 'app/theme/material/material.module';

import { InputDatePassageComponent } from './input-date-passage.component';
import { TranslateModule } from '@ngx-translate/core';

describe('InputDatePassageComponent', () => {
  let component: InputDatePassageComponent;
  let fixture: ComponentFixture<InputDatePassageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatMomentDateModule,
        MaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      declarations: [InputDatePassageComponent],
      providers: [
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
    fixture = TestBed.createComponent(InputDatePassageComponent);
    component = fixture.componentInstance;
    component.rowData = {
      annee: '2015',
      id: null,
      numero: '02',
      type: 'CI',
      date: new Date('1995-12-17T03:24:00'),
      toDelete: false,
      hasError: false,
      dateError: false,
      numeroError: false,
      anneeError: false,
      disable: false,
      modif: true
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the date passage when data is updated', () => {
    const control = component.formSessionDecision.get('date');
    const spyUpdateSessionDecisionEvent = spyOn(component.updateSessionDecisionEvent, 'emit');

    control.setValue(component.rowData.date);

    expect(spyUpdateSessionDecisionEvent.calls.any()).toBe(true);

    expect(spyUpdateSessionDecisionEvent.calls.any()).toBe(true);

  });

  it('should test input date errors', () => {
    const control = component.formSessionDecision.get('date');


    const dateInvalidValue = 'fffff';
    component.setControlDate();
    control.setValue(dateInvalidValue);
    expect(control.errors['matDatepickerParse']).toBeTruthy();

    const dateInvalidValueMin = { _d: new Date(1940, 12, 15), _i: { year: 1940, month: 12, date: 15 } };
    component.setControlDate();
    control.setValue(dateInvalidValueMin);
    // expect(control.errors['matDatepickerMin']).toBeTruthy();

  });

});

