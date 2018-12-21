import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DossierService } from '../../../../../dossiers.service';
import { DossierServiceStub } from '../../../../../dossiers.service.spec';
import { CaracteristiqueOuvrageComponent } from './caracteristique-ouvrage.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
describe('CaracteristiqueOuvrageComponent', () => {
  let component: CaracteristiqueOuvrageComponent;
  let fixture: ComponentFixture<CaracteristiqueOuvrageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CaracteristiqueOuvrageComponent],
      providers: [{ provide: DossierService, useClass: DossierServiceStub }],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaracteristiqueOuvrageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
