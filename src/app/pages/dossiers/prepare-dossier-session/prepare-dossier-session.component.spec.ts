import { TestBed, ComponentFixture, async, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';
import { NgaModule } from 'app/theme/nga.module';

import { Ng2SmartTableModule } from 'ng2-smart-table';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { DossierService } from './../dossiers.service';


import { DossierServiceStub } from '../dossiers.service.spec';
import { Critere } from 'app/pages/dossiers/recherche-dossier/recherche-dossier.interface';
import { DossierAction, SessionDecision } from 'app/pages/dossiers/dossier/dossier.interface';
import { EnumActionDossier, EnumProfilDossier } from 'app/pages/dossiers/dossier/enumeration/enumerations';
import { PrepareDossierSessionComponent } from 'app/pages/dossiers/prepare-dossier-session/prepare-dossier-session.component';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';
import { SpinnerLuncher } from '../../../shared/methodes-generiques';
import { SpinnerLuncherStub } from '../../../shared/test.helper';

describe('Unit Test of PrepareDossierSessionComponent', () => {
  let componentInstance: PrepareDossierSessionComponent;
  let fixture: ComponentFixture<PrepareDossierSessionComponent>;
  let dossierService: DossierService;

  let pipe: FormatMonetairePipe;

  beforeEach(() => {
    pipe = new FormatMonetairePipe();

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        BrowserAnimationsModule,
        NgaModule.forRoot(),
        Ng2SmartTableModule,
        FlexLayoutModule,
        RouterTestingModule.withRoutes([{ path: 'pages/dossiers/update', component: PrepareDossierSessionComponent }])
      ],
      declarations: [
        PrepareDossierSessionComponent
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: FormatMonetairePipe, useValue: pipe },
        { provide: SpinnerLuncher, useCLass: SpinnerLuncherStub }

      ]
    });

    fixture = TestBed.createComponent(PrepareDossierSessionComponent);
    componentInstance = fixture.componentInstance;
    dossierService = fixture.debugElement.injector.get(DossierService);
    const dummyCriteres: Critere = {
      thematique: null,
      departement: null,
      numeroIncrement: null,
      responsableTech: null,
      codeBenef: null,
      phase: 'T30',
      pageAAficher: null,
      nbElemPerPage: 100000,
      priorite: null,
      procedureDecision: null,
      codeServiceDept: null,
      delegation: null,
      domaine: null,
      listNatureOperation: null,
      hasReponseNontraite: null
    };

    const dossierAction: DossierAction = {
      profil: EnumProfilDossier.RL,
      action: EnumActionDossier.VALIDER,
      ids: []
    }

    const currentSession: SessionDecision = {
      annee: '2018',
      id: 1,
      numero: '1',
      type: 'CI'
    }

    componentInstance.currentCriteres = dummyCriteres;
    componentInstance.dossierAction = dossierAction;
    componentInstance.currentSession = currentSession;

    fixture.detectChanges();

  });

  it('should create', () => {
    expect(componentInstance).toBeTruthy();
  });

  it('#loadDataSource have to load datas by calling load method of our LocalDataSource', () => {
    fixture.detectChanges();
    componentInstance.dossiersDatas = [];
    const spyLoadLocalDataSource = spyOn(componentInstance.source, 'load').and.callThrough();
    const spyLoadLocalDataSourceTotal = spyOn(componentInstance.sourceTotals, 'load').and.callThrough();
    const spyLoadLocalDataSourceTotalSelected = spyOn(componentInstance.sourceTotalsSelectded, 'load').and.callThrough();

    expect(spyLoadLocalDataSource.calls.any()).toBe(false, 'loadDataSource not yet called');
    expect(spyLoadLocalDataSourceTotal.calls.any()).toBe(false, 'loadDataSourceTotal not yet called');
    expect(spyLoadLocalDataSourceTotalSelected.calls.any()).toBe(false, 'loadDataSourceTotalsSelected not yet called');

    componentInstance.loadDataSource();

    expect(spyLoadLocalDataSource.calls.any()).toBe(true, 'load should have been triggered when #loadDataSource is called');
    expect(spyLoadLocalDataSourceTotal.calls.any()).toBe(true, 'load shoud have been triggered when #loadDataSourceTotal is called');
    expect(spyLoadLocalDataSourceTotalSelected.calls.any()).toBe(true, 'load should have been triggered when #loadDataSourceTotal is called');
  });

  xit('#fetchResultatRecherche use the service to get the datas to display + calls the localDataSource methodes', () => {
    fixture.detectChanges();

    const spyLoadLocalDataSource = spyOn(componentInstance, 'loadDataSource').and.callThrough();
    const spyLoadLocalDataSourceTotal = spyOn(componentInstance, 'sourceTotals').and.callThrough();
    const spyLoadLocalDataSourceTotalSelected = spyOn(componentInstance, 'sourceTotalsSelectded').and.callThrough();

    const spyGetResultatRecherche = spyOn(dossierService, 'getResultatRecherche').and.callThrough();

    expect(spyLoadLocalDataSource.calls.any()).toBe(false, 'loadDataSource not yet called');
    expect(spyLoadLocalDataSourceTotal.calls.any()).toBe(false, 'sourceTotals not yet called');
    expect(spyLoadLocalDataSourceTotalSelected.calls.any()).toBe(false, 'sourceTotalsSelected not yet called');
    expect(spyGetResultatRecherche.calls.any()).toBe(false, 'the service haven\'t been called yet');

    componentInstance.fetchResultatRecherche(componentInstance.currentCriteres);

    expect(spyLoadLocalDataSource.calls.any()).toBe(true, 'loadDataSource should have been called durring #fetchResultatRecherche');
    // expect(spyLoadLocalDataSourceTotal.call(this.spyLoadLocalDataSource())).toBe(true, 'sourceTotals should have been called durring #fetchResultatRecherche');
    expect(spyGetResultatRecherche.calls.any()).toBe(true, 'the service have been called');
    expect(componentInstance.dossiersDatas).toBeTruthy();
  });

  it('#validerDevalider use the service to valider, devalidate selected dossiers + calls the fetchResultatRecherche methode',
    fakeAsync(() => {
      // fixture.detectChanges();

      const spyFetchResultatRecherche = spyOn(componentInstance, 'fetchResultatRecherche').and.callThrough();
      const spyBascValidDevalid = spyOn(dossierService, 'bascValidDevalid').and.callThrough();
      expect(spyFetchResultatRecherche.calls.any()).toBe(false, 'fetchResultatRecherche not yet called');
      expect(spyBascValidDevalid.calls.any()).toBe(false, 'the service haven\'t been called yet');

      componentInstance.validerDevalider();

      tick(500);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(spyBascValidDevalid.calls.any()).toBe(true, 'the service have been called');
        expect(spyFetchResultatRecherche.calls.any()).toBe(true, 'fetchResultatRecherche should have been called durring #fetchResultatRecherche');
      });
    }));


  it('the component should initialise it\'s list of "thematique", "responsableTechnique", "servdepts", "procedure decision" and "niveau priorite" by using a service',
    fakeAsync(() => {
      fixture.detectChanges();
      const spyGetThematiques = spyOn(dossierService, 'getThematiques').and.callThrough();
      const spyGetNatureOperation = spyOn(dossierService, 'getNatureOperation').and.callThrough();
      const spyGetSessionDecision = spyOn(dossierService, 'getSessionDecision').and.callThrough();
      const spyGetDomaines = spyOn(dossierService, 'getDomaines').and.callThrough();
      const spyGetNiveauPriorite = spyOn(dossierService, 'getNiveauPriorite').and.callThrough();
      const spyGetProcedureDecisions = spyOn(dossierService, 'getProcedureDecisions').and.callThrough();

      expect(spyGetThematiques.calls.any()).toBe(false, 'the service haven\'t been called yet');
      expect(spyGetNatureOperation.calls.any()).toBe(false, 'the service haven\'t been called yet');
      expect(spyGetSessionDecision.calls.any()).toBe(false, 'the service haven\'t been called yet');
      expect(spyGetDomaines.calls.any()).toBe(false, 'the service haven\'t been called yet');
      expect(spyGetNiveauPriorite.calls.any()).toBe(false, 'the service haven\'t been called yet');
      expect(spyGetProcedureDecisions.calls.any()).toBe(false, 'the service haven\'t been called yet');

      componentInstance.ngOnInit();

      expect(spyGetNatureOperation.calls.count()).toBe(1, 'the service have been called 1');
      expect(spyGetSessionDecision.calls.count()).toBe(1, 'the service have been called 2');

      expect(spyGetThematiques.calls.count()).toBe(1, 'the service have been called 3');
      expect(spyGetDomaines.calls.count()).toBe(1, 'the service have been called 4');
      expect(spyGetNiveauPriorite.calls.count()).toBe(1, 'the service have been called .5');
      expect(spyGetProcedureDecisions.calls.count()).toBe(1, 'the service have been called 6');

    }));

  it('#onTableRowClick should set the var dossier in the service + navigate to the proper view', fakeAsync(() => {
    componentInstance.checkIsClicked = false;
    fixture.detectChanges();
    let dummyFolder;
    const spyNavigate = spyOn(componentInstance.router, 'navigate');
    dossierService.getDossier(1).subscribe(
      (data) => {
        dummyFolder = data;
        componentInstance.onTableRowClick(dummyFolder);
      })


    tick(1500);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(spyNavigate).toHaveBeenCalledWith(['dossier/1']);
    })

  }));



});
