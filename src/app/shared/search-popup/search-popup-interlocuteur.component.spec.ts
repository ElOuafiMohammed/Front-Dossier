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
} from '@angular/material'

import { SearchPopupInterlocuteurComponent } from './search-popup-interlocuteur.component';
import { MaterialModule } from '../../theme/material/material.module';

import { TranslateModule } from '@ngx-translate/core';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { DossierServiceStub } from 'app/pages/dossiers/dossiers.service.spec';
import { CritereSearchBeneficiaire, Departements } from '../../pages/dossiers/dossiers.interface';


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


// Create a real (non-test) NgModule as a workaround for
const TEST_DIRECTIVES = [
  WithChildViewContainerComponent,
  WithViewContainerDirective,
  SearchPopupInterlocuteurComponent
];

@NgModule({
  imports: [
    MatDialogModule,
    NoopAnimationsModule,
    MatAutocompleteModule,
    TranslateModule.forRoot()],
  exports: TEST_DIRECTIVES,
  declarations: TEST_DIRECTIVES,
  entryComponents: [
    WithChildViewContainerComponent,
    SearchPopupInterlocuteurComponent
  ],
  providers: [
    { provide: DossierService, useClass: DossierServiceStub },
  ],
  schemas: [
    NO_ERRORS_SCHEMA
  ],
})
class DialogTestModule { }


/**
 * Unit Test of SearchPopupInterlocuteurComponent
 */
describe('Unit Test of SearchPopupInterlocuteurComponent', () => {
  let dialog: MatDialog;
  let dialogRef: MatDialogRef<SearchPopupInterlocuteurComponent>;
  let component: SearchPopupInterlocuteurComponent;
  let fixture: ComponentFixture<SearchPopupInterlocuteurComponent>;
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
      dialogRef = dialog.open(SearchPopupInterlocuteurComponent);
      dialogRef.componentInstance.dialogRef.afterClosed().subscribe(afterCloseCallback);
    }));

  afterEach(() => {
    // overlayContainer.ngOnDestroy();
  });

  beforeEach(() => {

    fixture = TestBed.createComponent(SearchPopupInterlocuteurComponent);
    component = fixture.componentInstance;
    component.data.valueStatusError = false;
    dossierService = fixture.debugElement.injector.get(DossierService);
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
    expect(component.nicControl.disable).toBeTruthy();
    expect(component.listCommune).toEqual([]);

    const departement: Departements = { id: 9, numero: '', nomDept: 'Ariège' };
    component.departementControl.setValue(departement);
    component.onBlurEventDepartement(departement);

    expect(component.communeControl.enable).toBeTruthy();
    expect(component.listCommune).not.toBeNull();
    // expect(component.listCommune.length).toEqual(2);
  });

  it('#onSearch use the service to get the datas to display + calls the localDataSource methode', () => {
    fixture.detectChanges();

    const dummyCriteres: CritereSearchBeneficiaire = {
      nom: 'LAS%',
      departement: null,
      commune: null,
      siren: null,
      nic: null,
      numeroAgence: null,
      inactif: null,
      nbElemPerPage: null,
      pageAAficher: null,
    };

    const spyLoadLocalDataSource = spyOn(component, 'loadDataSource').and.callThrough();
    const spygetResultatRechercheBeneficiaire = spyOn(dossierService, 'getResultatRechercheBeneficiaire').and.callThrough();

    expect(spyLoadLocalDataSource.calls.any()).toBe(false, 'loadDataSource not yet called');
    expect(spygetResultatRechercheBeneficiaire.calls.any()).toBe(false, 'the service haven\'t been called yet');

    component.onSearch(dummyCriteres);

    expect(spyLoadLocalDataSource.calls.any()).toBe(true, 'loadDataSource should have been called durring #onSearch');
    expect(spygetResultatRechercheBeneficiaire.calls.any()).toBe(true, 'the service have been called');
    expect(component.dataOfTable).toBeTruthy();
  });

});

