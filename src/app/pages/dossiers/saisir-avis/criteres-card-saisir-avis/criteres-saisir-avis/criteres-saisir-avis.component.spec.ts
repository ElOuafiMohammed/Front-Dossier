import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CriteresSaisirAvisComponent } from './criteres-saisir-avis.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'app/theme/material/material.module';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { DossierServiceStub } from 'app/pages/dossiers/dossiers.service.spec';
import { TranslateService, TranslatePipe, TranslateModule } from '@ngx-translate/core';
import { SpinnerLuncher } from '../../../../../shared/methodes-generiques';
import { SpinnerLuncherStub } from '../../../../../shared/test.helper';

describe('CriteresSaisirAvisComponent', () => {
  let component: CriteresSaisirAvisComponent;
  let fixture: ComponentFixture<CriteresSaisirAvisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        CommonModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot()
      ],
      declarations: [CriteresSaisirAvisComponent],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: TranslateService, useValue: TranslatePipe },
        { provide: SpinnerLuncher, useCLass: SpinnerLuncherStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CriteresSaisirAvisComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
