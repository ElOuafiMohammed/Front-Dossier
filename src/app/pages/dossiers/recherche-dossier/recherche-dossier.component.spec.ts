import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';
import { NgaModule } from 'app/theme/nga.module';

import { Ng2SmartTableModule } from 'ng2-smart-table';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { RechercheDossierComponent } from './recherche-dossier.component';

import { DossierService } from './../dossiers.service';

import { Critere } from './recherche-dossier.interface';

import { DossierServiceStub } from '../dossiers.service.spec';
import { SpinnerLuncher } from '../../../shared/methodes-generiques';
import { SpinnerLuncherStub } from '../../../shared/test.helper';

describe('Unit Test of RechercheDossierComponent', () => {
  let componentInstance: RechercheDossierComponent;
  let fixture: ComponentFixture<RechercheDossierComponent>;
  let dossierService: DossierService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        BrowserAnimationsModule,
        NgaModule.forRoot(),
        Ng2SmartTableModule,
        FlexLayoutModule,
        RouterTestingModule.withRoutes([{ path: 'pages/dossiers/update', component: RechercheDossierComponent }])
      ],
      declarations: [
        RechercheDossierComponent
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: SpinnerLuncher, useClass: SpinnerLuncherStub }
      ]
    });

    fixture = TestBed.createComponent(RechercheDossierComponent);
    componentInstance = fixture.componentInstance;
    dossierService = fixture.debugElement.injector.get(DossierService);
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(componentInstance).toBeTruthy();
  });

  it('the component should initialise it\'s list of "thematique", "responsableTechnique" and "depts" by using a service', () => {
    const spyGetDepts = spyOn(dossierService, 'getDepartements').and.callThrough();
    const spyGetResponsablesTech = spyOn(dossierService, 'getResponsableTech').and.callThrough();

    expect(spyGetDepts.calls.any()).toBe(false, 'the service haven\'t been called yet');
    expect(spyGetResponsablesTech.calls.any()).toBe(false, 'the service haven\'t been called yet');
    componentInstance.ngOnInit();
    expect(spyGetDepts.calls.count()).toBe(1, 'the service have been called');
    expect(spyGetResponsablesTech.calls.count()).toBe(1, 'the service have been called');

  });

  it('#loadDataSource have to load datas by calling load method of our LocalDataSource', () => {
    fixture.detectChanges();
    componentInstance.dossiersDatas = [];
    const spyLoadLocalDataSource = spyOn(componentInstance.source, 'load').and.callThrough();

    expect(spyLoadLocalDataSource.calls.any()).toBe(false, 'loadDataSource not yet called');

    componentInstance.loadDataSource();

    expect(spyLoadLocalDataSource.calls.any()).toBe(true, 'load should have been triggered when #loadDataSource is called');

  });

  it('#fetchResultatRecherche use the service to get the datas to display + calls the localDataSource methode', () => {
    fixture.detectChanges();

    const dummyCriteres: Critere = {
      thematique: '1',
      departement: null,
      numeroIncrement: null,
      responsableTech: null,
      codeBenef: null,
      phase: null,
      pageAAficher: null,
      nbElemPerPage: null,
      priorite: null,
      procedureDecision: null,
      codeServiceDept: null,
      delegation: null,
      domaine: null,
      natureOperation: null,
      hasReponseNontraite: null
    };

    const spyLoadLocalDataSource = spyOn(componentInstance, 'loadDataSource').and.callThrough();
    const spyGetResultatRecherche = spyOn(dossierService, 'getResultatRecherche').and.callThrough();

    expect(spyLoadLocalDataSource.calls.any()).toBe(false, 'loadDataSource not yet called');
    expect(spyGetResultatRecherche.calls.any()).toBe(false, 'the service haven\'t been called yet');

    componentInstance.fetchResultatRecherche(dummyCriteres);

    expect(spyLoadLocalDataSource.calls.any()).toBe(true, 'loadDataSource should have been called durring #fetchResultatRecherche');
    expect(spyGetResultatRecherche.calls.any()).toBe(true, 'the service have been called');
    expect(componentInstance.dossiersDatas).toBeTruthy();
  });

  it('#onTableRowClick should set the var dossier in the service + navigate to the proper view', fakeAsync(() => {
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
    });

    // expect(dossierService.currentDossierId).toBeUndefined();
    // componentInstance.displayFolder({ 'data': dummyFolder });
    // expect(dossierService.currentDossierId).toBeDefined();
    // expect(dossierService.currentDossierId).toEqual(dummyFolder.id);
  }));

});
