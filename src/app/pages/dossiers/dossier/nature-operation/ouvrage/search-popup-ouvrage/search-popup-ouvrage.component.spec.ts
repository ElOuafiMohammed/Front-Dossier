import {
  ComponentFixture,
  fakeAsync,
  inject,
  TestBed
} from '@angular/core/testing';
import {
  Component,
  Directive,
  NgModule,
  ViewChild,
  ViewContainerRef,
  NO_ERRORS_SCHEMA
} from '@angular/core';
import { NoopAnimationsModule, BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatAutocompleteModule,
  MatDialogConfig,
} from '@angular/material'

import { SearchPopupOuvrageComponent } from './search-popup-ouvrage.component';
import { MaterialModule } from 'app/theme/material/material.module';

import { TranslateModule } from '@ngx-translate/core';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { DossierServiceStub } from 'app/pages/dossiers/dossiers.service.spec';
import { CritereSearchOuvrage } from './search-popup-ouvrage.interface';
import { SearchPopupInterlocuteurComponent } from '../../../../../../shared/search-popup/search-popup-interlocuteur.component';
import { Commune, Departements } from '../../../../dossiers.interface';
import { Observable } from 'rxjs/Observable'

// tslint:disable-next-line:directive-selector
@Directive({ selector: 'dir-with-view-container' })
class WithViewContainerDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({
  selector: 'siga-arbitrary-component',
  template: `<dir-with-view-container></dir-with-view-container>`,
})

class WithChildViewContainerComponent {
  @ViewChild(WithViewContainerDirective) childWithViewContainer: WithViewContainerDirective;

  get childViewContainer() {
    return this.childWithViewContainer.viewContainerRef;
  }
}

/**
* Use a mocked class of my component to override certains parts that are used in the tests
* @see https://codecraft.tv/courses/angular/unit-testing/mocks-and-spies/#_mocking_by_overriding_functions
*/

// Create a real (non-test) NgModule as a workaround for
const TEST_DIRECTIVES = [
  WithChildViewContainerComponent,
  WithViewContainerDirective,
  SearchPopupOuvrageComponent
];

@NgModule({
  imports: [
    MatDialogModule,
    NoopAnimationsModule,
    MatAutocompleteModule,
    TranslateModule.forRoot()],
  exports: TEST_DIRECTIVES,
  declarations: [TEST_DIRECTIVES, SearchPopupInterlocuteurComponent],
  entryComponents: [
    WithChildViewContainerComponent,
    SearchPopupOuvrageComponent,
    SearchPopupInterlocuteurComponent,
  ],
  providers: [
    { provide: DossierService, useClass: DossierServiceStub },
  ],
  schemas: [
    NO_ERRORS_SCHEMA
  ]
})
class DialogTestModule { }


/**
 * Unit Test of SearchPopupOuvrageComponent
 */
describe('Unit Test of SearchPopupOuvrageComponent', () => {
  let dialog: MatDialog;
  let dialogRef: MatDialogRef<SearchPopupOuvrageComponent>;
  let component: SearchPopupOuvrageComponent;
  let fixture: ComponentFixture<SearchPopupOuvrageComponent>;
  let dossierService: DossierService;
  const afterCloseCallback = jasmine.createSpy('afterClose callback');
  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, MaterialModule, DialogTestModule, BrowserAnimationsModule],
      providers: [
        {
          provide: MatDialogRef, useValue: {}
        },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    });
    TestBed.compileComponents();
  }));

  beforeEach(inject([MatDialog],
    (d: MatDialog) => {
      dialog = d;
      dialogRef = dialog.open(SearchPopupOuvrageComponent);

      dialogRef.componentInstance.dialogRef.afterClosed().subscribe(afterCloseCallback);
    }));

  afterEach(() => {
    // overlayContainer.ngOnDestroy();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchPopupOuvrageComponent);
    component = fixture.componentInstance;
    component.data.valueStatusError = false;
    dossierService = fixture.debugElement.injector.get(DossierService);
    component.dossierService.getCommunes = (departements: Departements[]): Observable<any> => {

      const communes: Commune[] = [
        { nomCommune: '09001', numInsee: 'Aigues' },
        { nomCommune: '09002', numInsee: 'Aveyron' }
      ];
      return Observable.of(communes);
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.data.valueStatusError).toBe(false);
  });

  it('should have an invalid form by default (empty)', () => {
    fixture.detectChanges();
    expect(component.formSearchPopup.valid).toBeTruthy();
  });

  it('should manage an invalid Departement field value', () => {
    fixture.detectChanges();
    component.ngOnInit();
    const deptInvalidValue: Departements = { id: 0, numero: 'ff', nomDept: 'Département inconnu' };
    const deptControl = component.departementControl;
    const deptValidatorKey = component.departementValidatorKey;
    deptControl.setValue(deptInvalidValue);

    expect(deptControl.errors[deptValidatorKey]).toBeTruthy();
    expect(component.formSearchPopup.valid).toBeFalsy();
  });

  it('should manage commune field', () => {
    fixture.detectChanges();
    expect(component.communeControl.disable).toBeTruthy();
    expect(component.libelleOuvrageControl.disable).toBeTruthy();
    expect(component.listCommune).toEqual([]);

    const departement: Departements = { id: 9, numero: '09', nomDept: 'Ariège' };
    component.departementControl.setValue(component.listDepartement[8]);
    component.communeControl.setValue('09001');
    component.onBlurEventDepartement(departement);
    expect(component.communeControl.enable).toBeTruthy();
    expect(component.listCommune).not.toBeNull();
    expect(component.listCommune.length).toEqual(2);
  });

  it('#onSearch use the service to get the datas to display + calls the localDataSource methode', () => {
    fixture.detectChanges();
    const dummyCriteres: CritereSearchOuvrage = {
      maitreOuvrage: '00000000A',
      typeOuvrage: null,
      etat: null,
      departement: null,
      commune: null,
      libelle: null,
      nbElemPerPage: null,
      pageAAficher: null,
    };

    const spyLoadLocalDataSource = spyOn(component, 'loadDataSource').and.callThrough();
    const spygetResultatRechercheOuvrage = spyOn(dossierService, 'getResultatRechercheOuvrage').and.callThrough();

    expect(spyLoadLocalDataSource.calls.any()).toBe(false, 'loadDataSource not yet called');
    expect(spygetResultatRechercheOuvrage.calls.any()).toBe(false, 'the service haven\'t been called yet');

    component.onSearch(dummyCriteres);

    expect(spyLoadLocalDataSource.calls.any()).toBe(true, 'loadDataSource should have been called durring #onSearch');
    expect(spygetResultatRechercheOuvrage.calls.any()).toBe(true, 'the service have been called');
    expect(component.dataOfTable).toBeTruthy();
  });

  it('#onTableRowClick should set the var ouvrage field in the screen + navigate to the proper view', () => {
    fixture.detectChanges();
    const instance = {
      rowData: {
        id: 31,
        codeAgence: '31053100',
        typeAgence: 'EIP',
        libelle: 'S.C.I. CLINIQUE DE BEAUPUY',
      },
      value: true
    };
    component.onTableRowClick(instance);

    const instance2 = {
      rowData: {
        id: 32,
        codeAgence: '31053100',
        typeAgence: 'EIP',
        libelle: 'Etablissement industriel',
      },
      value: true
    }
    component.onTableRowClick(instance2);
    expect(component.ouvragesSelectedData.length).toEqual(2);
  });

  it(`#searchBeneficiary doit retourner le reference, raisonSociale du MaitreOuvrage au SearchPopupOuvrageComponent`, () => {

    // pour initialiser le formulaire des ouvrages.
    component.ngOnInit();
    // initialisation et ouverture du Popup de recherche Maitre d'ouvrage
    component.openSearchMaitreOuvrageDialog = () => {
      const config = new MatDialogConfig();
      config.width = '90 %';
      config.autoFocus = false;
      config.disableClose = true;
      // mock data
      config.data = { reference: '01262000A', raisonSociale: 'DESAUTEL S.A.' };
      return component.dialog.open(SearchPopupInterlocuteurComponent, config);
    }
    // execution de la fonction pour chercher et recuperer le maitre d'ouvrage.
    component.searchMaitreOuvrage();
    // fermeture du Popup de recherche Maitre d'ouvrage
    component.openSearchMaitreOuvrageDialog().close();
    // test des valeurs reoutrnées
    expect(component.openSearchMaitreOuvrageDialog().componentInstance.data.reference).toEqual('01262000A');
    expect(component.openSearchMaitreOuvrageDialog().componentInstance.data.raisonSociale).toEqual('DESAUTEL S.A.');
  });

  it('#onValidSearch should set data in variable data of component dialog, and close dialog', () => {
    fixture.detectChanges();
    component.ngOnInit();
    component.dialogRef.close = (param) => {
      dialogRef.close(false);
    }

    const instance = {
      rowData: {
        id: 31,
        codeAgence: '31053100',
        typeAgence: 'EIP',
        libelle: 'S.C.I. CLINIQUE DE BEAUPUY',
      },
      value: true
    };
    component.onTableRowClick(instance);

    const instance2 = {
      rowData: {
        id: 32,
        codeAgence: '31053100',
        typeAgence: 'EIP',
        libelle: 'Etablissement industriel',
      },
      value: true
    }
    component.onTableRowClick(instance2);

    component.onValidSearch();
    expect(component.data.length).toEqual(2);
  });

});

