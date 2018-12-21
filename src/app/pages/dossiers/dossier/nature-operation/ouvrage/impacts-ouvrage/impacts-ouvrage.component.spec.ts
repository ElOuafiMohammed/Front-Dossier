import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpactsOuvrageComponent } from './impacts-ouvrage.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('Impacts-ouvrage-Component', () => {
  let component: ImpactsOuvrageComponent;
  let fixture: ComponentFixture<ImpactsOuvrageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImpactsOuvrageComponent],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImpactsOuvrageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
