import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnneeInputComponent } from './annee-input.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'app/theme/material/material.module';
import { RouterTestingModule } from '@angular/router/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';


describe('AnneeInputComponent', () => {
  let component: AnneeInputComponent;
  let fixture: ComponentFixture<AnneeInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AnneeInputComponent],
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
    fixture = TestBed.createComponent(AnneeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
