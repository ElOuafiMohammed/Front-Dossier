import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MaterialModule } from 'app/theme/material/material.module';

import { ParametrageNatureOperationComponent } from './parametrage-nature-operation.component';

import { DossierService } from '../../../dossiers.service'
import { DossierServiceStub } from '../../../dossiers.service.spec'
import { SpinnerLuncherStub } from '../../../../../shared/test.helper';
import { SpinnerLuncher } from '../../../../../shared/methodes-generiques';
describe('ParametrageNatureOperationComponent', () => {
  let component: ParametrageNatureOperationComponent;
  let fixture: ComponentFixture<ParametrageNatureOperationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ParametrageNatureOperationComponent],
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule
      ],
      schemas: [
        NO_ERRORS_SCHEMA
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
  });

  it('should create', fakeAsync(() => {

    fixture.whenStable().then(() => {
      expect(component).toBeTruthy();
    });

  }));
});
