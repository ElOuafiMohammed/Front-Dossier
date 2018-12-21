import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Observable } from 'rxjs/Observable';
import { AccueilService } from './accueil.service';
import { Utilisateur } from './accueil.interface';
import { Critere, CritereRemarque } from 'app/pages/dossiers/recherche-dossier/recherche-dossier.interface';
import { AccueilComponent } from 'app/pages/dossiers/accueil/accueil.component';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { DossierServiceStub } from 'app/pages/dossiers/dossiers.service.spec';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgaModule } from 'app/theme/nga.module';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { TranslateModule } from '@ngx-translate/core';
import { Dossier } from '../dossiers.interface';

/**
 * Stub of AccueilService
 */
export class AccueilServiceStub {

  constructor() {
    // Initialize dossierUpdate subject
  }
  getUtilisateurConnecte(): Observable<Utilisateur> {
    const utilisateurConnecte: Utilisateur = {
      login: 'JEAN AKKA1',
      nom: 'AKKA1',
      prenom: 'JEAN'
    };
    return Observable.of(utilisateurConnecte);
  }
}

/**
 * Unit Test of AccueilService
 */
describe('AccueilService unit test', () => {
  let componentInstance: AccueilComponent;
  let fixture: ComponentFixture<AccueilComponent>;
  let dossierService: DossierService;
  beforeEach(() => {
    TestBed.configureTestingModule({

      imports: [
        HttpClientTestingModule,
        CommonModule,
        BrowserAnimationsModule,
        NgaModule.forRoot(),
        Ng2SmartTableModule,
        TranslateModule.forRoot(),
        FlexLayoutModule,
        RouterTestingModule.withRoutes([{ path: 'pages/dossiers/update', component: AccueilComponent }])
      ],
      declarations: [
        AccueilComponent
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        { provide: AccueilService, useClass: AccueilServiceStub },
        { provide: DossierService, useClass: DossierServiceStub }
      ]
    });

    fixture = TestBed.createComponent(AccueilComponent);
    componentInstance = fixture.componentInstance;
    dossierService = fixture.debugElement.injector.get(DossierService);
    fixture.detectChanges();
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    // httpMock.verify();
  });


  xit('#loadDataSource have to load datas by calling load method of our LocalDataSource', () => {
    // fixture.detectChanges();
    // componentInstance.dossiersDatas = [];
    // const spyLoadLocalDataSource = spyOn(componentInstance.dataSource, 'load').and.callThrough();

    // expect(spyLoadLocalDataSource.calls.any()).toBe(false, 'loadDataSource not yet called');

    // componentInstance.loadDataSource();

    // expect(spyLoadLocalDataSource.calls.any()).toBe(true, 'load should have been triggered when #loadDataSource is called');

  });



  it('#fetchResultatRecherche use the service to get the datas to display + calls the localDataSource methode', () => {
    fixture.detectChanges();
    const spyGetResultsResearchRemark = spyOn(dossierService, 'getResultsResearchRemark').and.callThrough();
    expect(spyGetResultsResearchRemark.calls.any()).toBe(false, 'loadDataSource not yet called');
    const dummyCriteres: CritereRemarque = {
      nbElemPerPage: null,
      loginDestinataire: 'MAS',
      repondu: false,
      archive: false
    };
    dossierService.getResultsResearchRemark(dummyCriteres).subscribe(data => {
      expect(data.dossiers.length).toBe(2);
    });
    expect(spyGetResultsResearchRemark.calls.any()).toBe(true, 'loadDataSource not yet called');
    componentInstance.getResult(dummyCriteres, 'toTrait');
    expect(spyGetResultsResearchRemark.calls.any()).toBe(true, 'loadDataSource not yet called');
    expect(spyGetResultsResearchRemark.calls.any()).toBe(true, 'the service have been called');
    expect(componentInstance.dossiersDatas).toBeTruthy();
  });
  it('#updateDossierLu use the service to get the datas to display + calls the localDataSource methode', () => {
    fixture.detectChanges();
    const spyUpdateDossierLu = spyOn(dossierService, 'updateDossierLu').and.callThrough();
    expect(spyUpdateDossierLu.calls.any()).toBe(false, 'loadDataSource not yet called');
    const dummyCriteres: CritereRemarque = {
      idDossier: 1,
      emetteur: 'MAS',
      lu: true,
      archive: false
    };
    dossierService.updateDossierLu(dummyCriteres).subscribe(data => {
      expect(data.lu).toBeFalsy()

    });
    expect(spyUpdateDossierLu.calls.any()).toBe(true, 'loadDataSource not yet called');
    expect(componentInstance.dossiersDatas).toBeTruthy();
  });
  it('#onTableRowClick should set the var dossier in the service + navigate to the proper view', () => {
    fixture.detectChanges();
    let dummyFolder;
    const spyNavigate = spyOn(componentInstance._router, 'navigate');
    dossierService.getDossier(1).subscribe(
      (data) => {
        dummyFolder = data;
        componentInstance.onTableRowClick(dummyFolder);
      })

    expect(spyNavigate).toHaveBeenCalledWith(['dossier/1']);
  });



});
