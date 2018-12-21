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
import { ValidateDossierComponent } from 'app/pages/dossiers/validate-dossier/validate-dossier.component';
import { Critere } from 'app/pages/dossiers/recherche-dossier/recherche-dossier.interface';
import { DossierAction } from 'app/pages/dossiers/dossier/dossier.interface';
import { EnumActionDossier, EnumProfilDossier } from 'app/pages/dossiers/dossier/enumeration/enumerations';
import { SpinnerLuncher } from '../../../shared/methodes-generiques';
import { SpinnerLuncherStub } from '../../../shared/test.helper';

describe('Unit Test of ValidateDossierComponent', () => {
  let componentInstance: ValidateDossierComponent;
  let fixture: ComponentFixture<ValidateDossierComponent>;
  let dossierService: DossierService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        BrowserAnimationsModule,
        NgaModule.forRoot(),
        Ng2SmartTableModule,
        FlexLayoutModule,
        RouterTestingModule.withRoutes([{ path: 'pages/dossiers/update', component: ValidateDossierComponent }])
      ],
      declarations: [
        ValidateDossierComponent
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: SpinnerLuncher, useClass: SpinnerLuncherStub }
      ]
    });

    fixture = TestBed.createComponent(ValidateDossierComponent);
    componentInstance = fixture.componentInstance;
    dossierService = fixture.debugElement.injector.get(DossierService);
    const dummyCriteres: Critere = {
      thematique: null,
      departement: null,
      numeroIncrement: null,
      responsableTech: null,
      codeBenef: null,
      domaine: null,
      natureOperation: null,
      phase: 'T15',
      pageAAficher: null,
      nbElemPerPage: 100000,
      priorite: null,
      procedureDecision: null,
      codeServiceDept: null,
      delegation: null,
      hasReponseNontraite: null
    };

    const dossierAction: DossierAction = {
      profil: EnumProfilDossier.RL,
      action: EnumActionDossier.VALIDER,
      ids: []
    }

    componentInstance.currentCriteres = dummyCriteres;
    componentInstance.dossierAction = dossierAction;

    fixture.detectChanges();

  });

  it('should create', () => {
    expect(componentInstance).toBeTruthy();
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

    const spyLoadLocalDataSource = spyOn(componentInstance, 'loadDataSource').and.callThrough();
    const spyGetResultatRecherche = spyOn(dossierService, 'getResultatRecherche').and.callThrough();

    expect(spyLoadLocalDataSource.calls.any()).toBe(false, 'loadDataSource not yet called');
    expect(spyGetResultatRecherche.calls.any()).toBe(false, 'the service haven\'t been called yet');

    componentInstance.fetchResultatRecherche(componentInstance.currentCriteres);

    expect(spyLoadLocalDataSource.calls.any()).toBe(true, 'loadDataSource should have been called durring #fetchResultatRecherche');
    expect(spyGetResultatRecherche.calls.any()).toBe(true, 'the service have been called');
    expect(componentInstance.dossiersDatas).toBeTruthy();
  });

  it('#validerDevalider use the service to valider, devalidate selected dossiers + calls the fetchResultatRecherche methode', () => {
    fixture.detectChanges();

    const spyFetchResultatRecherche = spyOn(componentInstance, 'fetchResultatRecherche').and.callThrough();
    const spyBascValidDevalid = spyOn(dossierService, 'bascValidDevalid').and.callThrough();

    expect(spyFetchResultatRecherche.calls.any()).toBe(false, 'fetchResultatRecherche not yet called');
    expect(spyBascValidDevalid.calls.any()).toBe(false, 'the service haven\'t been called yet');

    componentInstance.valiDevalid(null);

    expect(spyBascValidDevalid.calls.any()).toBe(true, 'the service have been called');
    expect(spyFetchResultatRecherche.calls.any()).toBe(true, 'fetchResultatRecherche should have been called durring #fetchResultatRecherche');
  });


  xit('the component should initialise it\'s list of "thematique", "responsableTechnique", "servdepts", "procedure decision" and "niveau priorite" by using a service',
    fakeAsync(() => {
      const spyGetThematiques = spyOn(dossierService, 'getThematiques').and.callThrough();
      const spyGetDelegation = spyOn(dossierService, 'getDelegation').and.callThrough();
      const spyGetResponsablesTech = spyOn(dossierService, 'getResponsableTech').and.callThrough();
      const spyGetNiveauPriorite = spyOn(dossierService, 'getNiveauPriorite').and.callThrough();
      const spyGetProcedureDecisions = spyOn(dossierService, 'getProcedureDecisions').and.callThrough();

      expect(spyGetThematiques.calls.any()).toBe(false, 'the service haven\'t been called yet');
      expect(spyGetDelegation.calls.any()).toBe(false, 'the service haven\'t been called yet');
      expect(spyGetResponsablesTech.calls.any()).toBe(false, 'the service haven\'t been called yet');
      expect(spyGetNiveauPriorite.calls.any()).toBe(false, 'the service haven\'t been called yet');
      expect(spyGetProcedureDecisions.calls.any()).toBe(false, 'the service haven\'t been called yet');

      componentInstance.ngOnInit();


      tick(1500);
      // fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(spyGetThematiques.calls.count()).toBe(2, 'the service have been called');
        expect(spyGetDelegation.calls.count()).toBe(2, 'the service have been called');
        expect(spyGetResponsablesTech.calls.count()).toBe(1, 'the service have been called');
        expect(spyGetNiveauPriorite.calls.count()).toBe(2, 'the service have been called4');
        expect(spyGetProcedureDecisions.calls.count()).toBe(2, 'the service have been called5');
      });

    }));

  it('#onTableRowClick should set the var dossier in the service + navigate to the proper view',
    fakeAsync(() => {
      componentInstance.checkIsClicked = false;
      fixture.detectChanges();
      let dummyFolder;
      const spyNavigate = spyOn(componentInstance.router, 'navigate');
      dossierService.getDossier(1).subscribe(
        (data) => {
          dummyFolder = data;
          componentInstance.onTableRowClick(dummyFolder);
        })

      tick(150);
      fixture.detectChanges();
      fixture.whenStable().then(() => expect(spyNavigate).toHaveBeenCalledWith(['dossier/1']));

    }));



});
