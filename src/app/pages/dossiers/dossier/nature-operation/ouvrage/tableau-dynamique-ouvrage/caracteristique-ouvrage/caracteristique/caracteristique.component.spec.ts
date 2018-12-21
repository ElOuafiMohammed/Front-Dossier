import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaracteristiqueComponent } from './caracteristique.component';
import { MaterialModule } from 'app/theme/material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CaracteristiqueComponent', () => {
  let component: CaracteristiqueComponent;
  let fixture: ComponentFixture<CaracteristiqueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
      ],
      declarations: [CaracteristiqueComponent],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaracteristiqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
