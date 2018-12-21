import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametrageDossierComponent } from './parametrage-dossier.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
describe('ParametrageDossierComponent', () => {
  let component: ParametrageDossierComponent;
  let fixture: ComponentFixture<ParametrageDossierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ParametrageDossierComponent],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParametrageDossierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
