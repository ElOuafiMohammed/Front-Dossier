import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MaterialModule } from 'app/theme/material/material.module';

import { InputLibelleComponent } from './input-libelle.component';

describe('InputLibelleComponent', () => {
  let component: InputLibelleComponent;
  let fixture: ComponentFixture<InputLibelleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InputLibelleComponent],
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputLibelleComponent);
    component = fixture.componentInstance;
    component.rowData = {
      codeThematique: 'AEEP',
      dateDebutValidite: '1964-12-16T00:00:00.000+0000',
      dateError: false,
      dateFinValidite: '16/02/2018',
      disable: true,
      hasError: false,
      id: 48234,
      libelle: 'Libelle de natures operation',
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

  it('should emit the libelle when data is updated', () => {
    fixture.detectChanges();
    const control = component.formNatureOperation.get('libelle');
    const spyupdateNatureEvent = spyOn(component.updateNatureEvent, 'emit');

    control.setValue(component.rowData.libelle);

    expect(spyupdateNatureEvent.calls.any()).toBe(false);

    component.onBlur();
    expect(spyupdateNatureEvent.calls.any()).toBe(true);

  });

});
