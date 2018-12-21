import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { SaisirAvisComponent } from './saisir-avis.component';
import { DossierService } from '../../dossiers.service';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgaModule } from '../../../../theme/nga.module';
import { MatTableModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterTestingModule } from '@angular/router/testing';
import { DossierServiceStub } from '../../dossiers.service.spec';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Critere } from '../../recherche-dossier/recherche-dossier.interface';
import { DossierAction } from '../../dossier/dossier.interface';
import { EnumProfilDossier, EnumActionDossier } from '../../dossier/enumeration/enumerations';
import { FormatMonetairePipe } from '../../../../theme/pipes/formatMonetaire/format-monetaire.pipe';
import { Observable } from 'rxjs/Observable';
import { Dossier, AvisDossier } from '../../dossiers.interface';
import { SpinnerLuncher } from '../../../../shared/methodes-generiques';
import { SpinnerLuncherStub } from '../../../../shared/test.helper';

describe('SaisirAvisComponent', () => {
  let component: SaisirAvisComponent;
  let fixture: ComponentFixture<SaisirAvisComponent>;
  let dossierService: DossierService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        BrowserAnimationsModule,
        NgaModule.forRoot(),
        MatTableModule,
        FlexLayoutModule,
        RouterTestingModule.withRoutes([{ path: 'pages/dossiers/update', component: SaisirAvisComponent }]),
      ],
      declarations: [
        SaisirAvisComponent
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: SpinnerLuncher, useClass: SpinnerLuncherStub },
        FormatMonetairePipe
      ]
    });


    fixture = TestBed.createComponent(SaisirAvisComponent);
    component = fixture.componentInstance;
    dossierService = fixture.debugElement.injector.get(DossierService);
    const criteresRecherche: Critere = {
      thematique: null,
      phase: 'T30',
      pageAAficher: null,
      nbElemPerPage: 100000,
      procedureDecision: null,
      codeServiceDept: null,
      delegation: null,
      domaine: null,
      natureOperation: null,
      hasReponseNontraite: null
    };
    const dossierAction: DossierAction = {
      profil: EnumProfilDossier.DGA,
      action: EnumActionDossier.AVISER,
      ids: []
    }

    component.currentCriteres = criteresRecherche;
    component.dossierAction = dossierAction;

  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#fetchResultatRecherche use the service to get the datas to display + calls the localDataSource methodes', () => {
    // fixture.detectChanges();

    const spyLoadLocalDataSource = spyOn(component, 'fetchResultatRecherche').and.callThrough();
    // const spyLoadLocalDataSourceTotal = spyOn(component, 'calculTotalMonantAide').and.callThrough();

    const spyGetResultatRecherche = spyOn(dossierService, 'getResultatRecherche').and.callThrough();

    expect(spyLoadLocalDataSource.calls.any()).toBe(false, 'loadDataSource not yet called');
    //  expect(spyLoadLocalDataSourceTotal.calls.any()).toBe(false, 'loadDataSourceTotal not yet called');
    expect(spyGetResultatRecherche.calls.any()).toBe(false, 'the service haven\'t been called yet');

    component.fetchResultatRecherche(component.currentCriteres);

    expect(spyLoadLocalDataSource.calls.any()).toBe(true, 'loadDataSource should have been called durring #fetchResultatRecherche');
    //  expect(spyLoadLocalDataSourceTotal.calls.any()).toBe(true, 'loadDataSourceTotal should have been called durring #fetchResultatRecherche');
    expect(spyGetResultatRecherche.calls.any()).toBe(true, 'the service have been called');
    expect(component.dossiersDatas).toBeTruthy();
  });

  xit('the component should initialise it\'s list of "thematique", "procedure decision" by using a service',
    fakeAsync(() => {
      const spyGetThematiques = spyOn(dossierService, 'getThematiques').and.callThrough();
      const spyGetSessionDecision = spyOn(dossierService, 'getSessionDecision').and.callThrough();
      const spyGetProcedureDecisions = spyOn(dossierService, 'getProcedureDecisions').and.callThrough();

      expect(spyGetThematiques.calls.any()).toBe(false, 'the service haven\'t been called yet');
      expect(spyGetSessionDecision.calls.any()).toBe(false, 'the service haven\'t been called yet');
      expect(spyGetProcedureDecisions.calls.any()).toBe(false, 'the service haven\'t been called yet');

      component.ngOnInit();
      expect(spyGetSessionDecision.calls.count()).toBe(1, 'the service have been called');

      tick(1500);
      expect(spyGetThematiques.calls.count()).toBe(1, 'the service have been called');
      expect(spyGetProcedureDecisions.calls.count()).toBe(1, 'the service have been called');
    }));

});

