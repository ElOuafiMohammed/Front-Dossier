import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ParametrageNatureOperationComponent } from '../parametrage-nature-operation/parametrage-nature-operation.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { DossierService } from '../../../dossiers.service'
import { DossierServiceStub } from '../../../dossiers.service.spec'
import { MaterialModule } from 'app/theme/material/material.module';
import { SpinnerLuncher } from '../../../../../shared/methodes-generiques';
import { SpinnerLuncherStub } from '../../../../../shared/test.helper';


describe('ParametrageNatureOperationComponent', () => {
  let component: ParametrageNatureOperationComponent;
  let fixture: ComponentFixture<ParametrageNatureOperationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ParametrageNatureOperationComponent],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: SpinnerLuncher, useClass: SpinnerLuncherStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParametrageNatureOperationComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
