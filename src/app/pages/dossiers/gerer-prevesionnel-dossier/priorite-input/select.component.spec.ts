import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MaterialModule } from 'app/theme/material/material.module';
import { NiveauPriorite } from '../../dossier/dossier.interface';
import { SelectComponent } from 'app/pages/dossiers/gerer-prevesionnel-dossier/priorite-input/select.component';


describe('SelectComponent', () => {
  let component: SelectComponent;
  let fixture: ComponentFixture<SelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SelectComponent],
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
    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    component.rowData = {
      priorite: null
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the libelle when data is updated', () => {
    fixture.detectChanges();
    const editApplicationEventSelect = spyOn(component.editApplicationEventSelect, 'emit');

    expect(editApplicationEventSelect.calls.any()).toBe(false);
    const priorite: NiveauPriorite = {
      id: 0,
      code: 'NP',
      libelle: 'Niveau priorite'
    }
    component.change(priorite);
    expect(editApplicationEventSelect.calls.any()).toBe(true);

  });

});
