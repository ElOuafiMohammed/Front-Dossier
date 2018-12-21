import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from 'app/theme/material/material.module';
// tslint:disable-next-line:max-line-length
import { CritereCardSessionDecisionComponent } from 'app/pages/dossiers/parametrage/parametrage-dossier/parametrage-session-decision/critere-card-session-decision/critere-card-session-decision.component';
import { DossierService } from '../../../../dossiers.service'
import { DossierServiceStub } from '../../../../dossiers.service.spec'
import { SpinnerLuncherStub } from '../../../../../../shared/test.helper';
import { SpinnerLuncher } from '../../../../../../shared/methodes-generiques';
describe('CritereCardSessionDecisionComponent', () => {
  let component: CritereCardSessionDecisionComponent;
  let fixture: ComponentFixture<CritereCardSessionDecisionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CritereCardSessionDecisionComponent],
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
    fixture = TestBed.createComponent(CritereCardSessionDecisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
