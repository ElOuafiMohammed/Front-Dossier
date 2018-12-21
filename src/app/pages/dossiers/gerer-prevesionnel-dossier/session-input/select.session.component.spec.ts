import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MaterialModule } from 'app/theme/material/material.module';
import { SelectSessionComponent } from 'app/pages/dossiers/gerer-prevesionnel-dossier/session-input/select-session.component';
import { SessionDecision } from '../../dossier/dossier.interface';


describe('SelectSessionComponent', () => {
  let component: SelectSessionComponent;
  let fixture: ComponentFixture<SelectSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SelectSessionComponent],
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule
      ],
      providers: [DatePipe],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectSessionComponent);
    component = fixture.componentInstance;
    component.rowData = {
      sessionDecisionPrevi: null
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
    const newSession: SessionDecision = {
      id: 0,
      annee: '1990',
      numero: '1000',
      type: 'CI'
    }
    component.change(newSession);
    expect(editApplicationEventSelect.calls.any()).toBe(true);

  });

});
