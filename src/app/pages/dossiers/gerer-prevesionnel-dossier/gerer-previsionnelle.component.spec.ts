import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

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
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';
import { GererPrevisionnelleComponent } from 'app/pages/dossiers/gerer-prevesionnel-dossier/gerer-previsionnelle.component';
import { SpinnerLuncher } from '../../../shared/methodes-generiques';
import { SpinnerLuncherStub } from '../../../shared/test.helper';

describe('Unit Test of GererPrevisionnelleComponent', () => {
  let componentInstance: GererPrevisionnelleComponent;
  let fixture: ComponentFixture<GererPrevisionnelleComponent>;
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
        RouterTestingModule.withRoutes([{ path: 'pages/dossiers/update', component: GererPrevisionnelleComponent }])
      ],
      declarations: [
        GererPrevisionnelleComponent
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: FormatMonetairePipe, useValue: pipe },
        { provide: SpinnerLuncher, useClass: SpinnerLuncherStub }

      ]
    });

    fixture = TestBed.createComponent(GererPrevisionnelleComponent);
    componentInstance = fixture.componentInstance;
    dossierService = fixture.debugElement.injector.get(DossierService);
    const dummyCriteres: Critere = {
      thematique: null,
      departement: null,
      numeroIncrement: null,
      responsableTech: null,
      codeBenef: null,
      phase: 'P00',
      nbElemPerPage: 100000,
    };

    componentInstance.currentCriteres = dummyCriteres;

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

    expect(spyLoadLocalDataSource.calls.any()).toBe(false, 'loadDataSource not yet called');
    expect(spyLoadLocalDataSourceTotal.calls.any()).toBe(false, 'loadDataSourceTotal not yet called');

    componentInstance.loadDataSource();

    expect(spyLoadLocalDataSource.calls.any()).toBe(true, 'load should have been triggered when #loadDataSource is called');
    expect(spyLoadLocalDataSourceTotal.calls.any()).toBe(true, 'load shoud have been triggered when #loadDataSourceTotal is called');
  });

  it('#fetchResultatRecherche use the service to get the datas to display + calls the localDataSource methodes', () => {
    fixture.detectChanges();

    const spyLoadLocalDataSource = spyOn(componentInstance, 'loadDataSource').and.callThrough();
    const spyLoadLocalDataSourceTotal = spyOn(componentInstance, 'sourceTotals').and.callThrough();

    const spyGetResultatRecherche = spyOn(dossierService, 'getResultatRecherche').and.callThrough();

    expect(spyLoadLocalDataSource.calls.any()).toBe(false, 'loadDataSource not yet called');
    expect(spyLoadLocalDataSourceTotal.calls.any()).toBe(false, 'sourceTotals not yet called');
    expect(spyGetResultatRecherche.calls.any()).toBe(false, 'the service haven\'t been called yet');

    componentInstance.fetchResultatRecherche(componentInstance.currentCriteres);

    expect(spyLoadLocalDataSource.calls.any()).toBe(true, 'loadDataSource should have been called durring #fetchResultatRecherche');
    expect(spyGetResultatRecherche.calls.any()).toBe(true, 'the service have been called');
    expect(componentInstance.dossiersDatas).toBeTruthy();
  });


  it('the component should initialise it\'s list of "thematique", "phases", and "niveau priorite" by using a service', () => {
    const spyGetThematiques = spyOn(dossierService, 'getThematiques').and.callThrough();
    const spyGetSessionDecision = spyOn(dossierService, 'getSessionPrevisionnel').and.callThrough();
    const getPhases = spyOn(dossierService, 'getPhases').and.callThrough();
    const spyGetNiveauPriorite = spyOn(dossierService, 'getNiveauPriorite').and.callThrough();

    expect(spyGetThematiques.calls.any()).toBe(false, 'the service haven\'t been called yet');
    expect(spyGetSessionDecision.calls.any()).toBe(false, 'the service haven\'t been called yet');
    expect(getPhases.calls.any()).toBe(false, 'the service haven\'t been called yet');
    expect(spyGetNiveauPriorite.calls.any()).toBe(false, 'the service haven\'t been called yet');

    componentInstance.ngOnInit();
    expect(spyGetSessionDecision.calls.count()).toBe(1, 'the service have been called');
  });

  it('#onTableRowClick should set the var dossier in the service + navigate to the proper view', () => {
    fixture.detectChanges();
    let dummyFolder;
    const spyNavigate = spyOn(componentInstance.router, 'navigate');
    dossierService.getDossier(1).subscribe(
      (data) => {
        dummyFolder = data;
        componentInstance.onTableRowClick(dummyFolder);
        expect(spyNavigate).toHaveBeenCalledWith(['dossier/1']);
      });
  });

  it('#submit use the service to save updated dossiers', () => {
    fixture.detectChanges();

    const spySaveGestionPrev = spyOn(dossierService, 'saveGestionPrev').and.callThrough();

    expect(spySaveGestionPrev.calls.any()).toBe(false, 'the service haven\'t been called yet');

    componentInstance.submit();

    expect(spySaveGestionPrev.calls.any()).toBe(true, 'the service have been called');

  });

});

