import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MaterialModule } from 'app/theme/material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { CritereCardLigneComponent } from './critere-card-ligne.component';
import { DossierService } from '../../../../dossiers.service'
import { SpinnerLuncher } from '../../../../../../shared/methodes-generiques';
import { SpinnerLuncherStub } from '../../../../../../shared/test.helper';
import { DossierServiceStub } from '../../../../dossiers.service.spec'
xdescribe('CritereCardLigneComponent', () => {
  let component: CritereCardLigneComponent;
  let fixture: ComponentFixture<CritereCardLigneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CritereCardLigneComponent],
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        TranslateModule.forRoot()
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
    fixture = TestBed.createComponent(CritereCardLigneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
