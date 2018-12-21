import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BenefciaireComponent } from './benefciaire.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'app/theme/material/material.module';
import { RouterTestingModule } from '@angular/router/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('BenefciaireComponent', () => {
  let component: BenefciaireComponent;
  let fixture: ComponentFixture<BenefciaireComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BenefciaireComponent],
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
    fixture = TestBed.createComponent(BenefciaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
