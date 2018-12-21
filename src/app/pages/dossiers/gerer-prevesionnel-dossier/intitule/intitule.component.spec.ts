import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntituleComponent } from './intitule.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'app/theme/material/material.module';
import { RouterTestingModule } from '@angular/router/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
describe('IntituleComponent', () => {
  let component: IntituleComponent;
  let fixture: ComponentFixture<IntituleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IntituleComponent],
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
    fixture = TestBed.createComponent(IntituleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
