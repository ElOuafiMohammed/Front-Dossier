import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterTestingModule } from '@angular/router/testing';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { NgaModule } from 'app/theme/nga.module';
import { Critere } from 'app/pages/dossiers/recherche-dossier/recherche-dossier.interface';
import { DossierAction, SessionDecision } from 'app/pages/dossiers/dossier/dossier.interface';
import { EnumActionDossier, EnumProfilDossier } from 'app/pages/dossiers/dossier/enumeration/enumerations';
import { AttribuerAidesComponent } from './attribuer-aides.component';
import { DossierServiceStub } from '../dossiers.service.spec';
import { SpinnerLuncher } from '../../../shared/methodes-generiques';
import { SpinnerLuncherStub } from '../../../shared/test.helper';

describe('AttribuerAidesComponent', () => {
  let component: AttribuerAidesComponent;
  let fixture: ComponentFixture<AttribuerAidesComponent>;

  let dossierService: DossierService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        BrowserAnimationsModule,
        NgaModule.forRoot(),
        Ng2SmartTableModule,
        FlexLayoutModule,
        RouterTestingModule.withRoutes([{ path: 'pages/dossiers/update', component: AttribuerAidesComponent }])
      ],
      declarations: [
        AttribuerAidesComponent
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: SpinnerLuncher, useClass: SpinnerLuncherStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AttribuerAidesComponent);
    component = fixture.componentInstance;
    dossierService = fixture.debugElement.injector.get(DossierService);
    const dummyCriteres: Critere = {
      thematique: null,
      departement: null,
      numeroIncrement: null,
      responsableTech: null,
      codeBenef: null,
      pageAAficher: null,
      nbElemPerPage: 100000,
      priorite: null,
      procedureDecision: null,
      codeServiceDept: null,
      delegation: null,
      domaine: null,
      natureOperation: null,
      hasReponseNontraite: null,
      listPhase: ['A01', 'A02']
    };

    const dossierAction: DossierAction = {
      action: EnumActionDossier.ATTRIBUER_AIDE,
      dateAttributionAide: null,
      ids: []
    }

    const currentSession: SessionDecision = {
      annee: '2018',
      id: 1,
      numero: '1',
      type: 'CI'
    }
    component.currentCriteres = dummyCriteres;
    component.dossierAction = dossierAction;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('#fetchResultatRecherche use the service to get the datas to display + calls the localDataSource methodes', () => {
    fixture.detectChanges();
    const spyLoadLocalDataSource = spyOn(component, 'loadDataSource').and.callThrough();
    const spyGetResultatRecherche = spyOn(dossierService, 'getResultatRecherche').and.callThrough();

    expect(spyLoadLocalDataSource.calls.any()).toBe(false, 'loadDataSource not yet called');
    expect(spyGetResultatRecherche.calls.any()).toBe(false, 'the service haven\'t been called yet');

    component.fetchResultatRecherche(component.currentCriteres);

    expect(spyLoadLocalDataSource.calls.any()).toBe(true, 'loadDataSource should have been called durring #fetchResultatRecherche');
    // expect(spyLoadLocalDataSourceTotal.call(this.spyLoadLocalDataSource())).toBe(true, 'sourceTotals should have been called durring #fetchResultatRecherche');
    expect(spyGetResultatRecherche.calls.any()).toBe(true, 'the service have been called');
    expect(component.dossiersDatas).toBeTruthy();
  });

  it('#onTableRowClick should set the var dossier in the service + navigate to the proper view', () => {
    component.checkIsClicked = false;
    fixture.detectChanges();
    let dummyFolder;
    const spyNavigate = spyOn(component.router, 'navigate');
    dossierService.getDossier(1).subscribe(
      (data) => {
        dummyFolder = data;
        component.onTableRowClick(dummyFolder);
      })
    expect(spyNavigate).toHaveBeenCalledWith(['dossier/1']);

  });

});






