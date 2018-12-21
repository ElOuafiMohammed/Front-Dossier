import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MaterialModule } from 'app/theme/material/material.module';

import { InputAnneeSdComponent } from './input-annee-sd.component';
import { TranslateModule, TranslateService, TranslatePipe } from '@ngx-translate/core';

describe('InputAnneeSdComponent', () => {
  let component: InputAnneeSdComponent;
  let fixture: ComponentFixture<InputAnneeSdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InputAnneeSdComponent],
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: TranslateService, useValue: TranslatePipe },
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputAnneeSdComponent);
    component = fixture.componentInstance;
    component.rowData = {
      annee: '2015',
      id: null,
      numero: '02',
      type: 'CI',
      date: new Date(),
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

  it('should emit the numero when data is updated', () => {
    fixture.detectChanges();
    const control = component.formSessionDecision.get('annee');
    const spyupdateSessionDecisionEvent = spyOn(component.updateSessionDecisionEvent, 'emit');

    control.setValue(component.rowData.numero);

    expect(spyupdateSessionDecisionEvent.calls.any()).toBe(false);

    component.onBlur();
    expect(spyupdateSessionDecisionEvent.calls.any()).toBe(true);

  });

});
