import { RefuseDossierPopupComponent } from './refuse-dossier-popup.component';
import { TestBed, ComponentFixture,  inject, fakeAsync, flush,  tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef,  MatAutocompleteModule, MatDialogModule } from '@angular/material';
import { Component, ViewContainerRef, NgModule, ViewChild, Directive } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MaterialModule } from './../../../theme/material/material.module';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { SpyLocation } from '@angular/common/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { NatureRefus } from './refuse-dossier-popup.interface'

import { DossierService } from './../dossiers.service';
import { DossierServiceStub } from '../dossiers.service.spec';


import { MockBackend } from '@angular/http/testing';
import { XHRBackend } from '@angular/http';
import { OverlayContainer } from '@angular/cdk/overlay';
import { HttpLoaderFactory } from 'app/app.module';
import { of } from 'rxjs/observable/of';

const translations: any = { 'TEST': 'This is a test' };
class FakeLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of(translations);
  }
}

describe('Component: Refus dossier', () => {
  let componentInstance: RefuseDossierPopupComponent;
  let fixture: ComponentFixture<RefuseDossierPopupComponent>;

  let dialog: MatDialog;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<WithChildViewContainerComponent>;
  let mockLocation: SpyLocation;
  let dossierService: DossierService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule,
        DialogTestModule
      ],

      providers: [
        { provide: TranslateService, useValue: { translate: null } },
        {
          provide: MatDialogRef, useValue: {}
        },
        { provide: Location, useClass: SpyLocation },
        { provide: ActivatedRoute, useValue: { 'params': Observable.from([{ 'dossierId': 1 }]) } },
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: XHRBackend, useClass: MockBackend }
      ]
    });

    fixture = TestBed.createComponent(RefuseDossierPopupComponent);
    dossierService = fixture.debugElement.injector.get(DossierService);
    dossierService.getDossier(1).subscribe(dossier => fixture.componentInstance.dossierService.dossier = dossier);
    componentInstance = fixture.componentInstance;
    componentInstance.ngOnInit();
  });

  beforeEach(
    inject([MatDialog, Location, OverlayContainer],
      (d: MatDialog, l: Location, oc: OverlayContainer) => {
        dialog = d;
        mockLocation = l as SpyLocation;
        overlayContainer = oc;
        overlayContainerElement = oc.getContainerElement();
      })
  );

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(WithChildViewContainerComponent);
    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should create component', () => {
    expect(componentInstance).toBeTruthy();
  });

  it('should have an invalid form by default (empty)', () => {
    expect(componentInstance.formRefus.valid).toBeFalsy();
  });

  it('should manage an invalid Thematique field value', fakeAsync(() => {
    fixture.detectChanges();
    const form = componentInstance.formRefus;
    const natureControl = componentInstance.natureControl;
    const natureValidatorKey = componentInstance.natureValidatorKey;

    tick(1500);
    expect(natureControl.errors['required']).toBeTruthy();

    const natureInvalidValue: NatureRefus = { id: 0, code: 'NTRE', libelle: 'Invalid nature' };
    natureControl.setValue(natureInvalidValue);

    expect(natureControl.errors[natureValidatorKey]).toBeTruthy();
    expect(form.valid).toBeFalsy();
  }));

  it('should manage an invalid Intitule field value', () => {
    const form = componentInstance.formRefus;
    const motifControl = componentInstance.motifControl;

    expect(motifControl.errors['required']).toBeTruthy();

    const MotifInvalidValue = '01234567890123456789012345678901234567890123456789012345678901234567890123456' +
      '789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012' +
      '3456789012345678901234567890123456789012345678901234567890123456789M';

    motifControl.setValue(MotifInvalidValue);

    expect(motifControl.errors['maxlength']).toBeTruthy();
    expect(form.valid).toBeFalsy();
  });

  it(`form should be valid`, fakeAsync(() => {
    fixture.detectChanges();
    const form = componentInstance.formRefus;
    const natureControl = componentInstance.natureControl;
    const motifControl = componentInstance.motifControl;
    const dialogRef = dialog.open(RefuseDossierPopupComponent);
    componentInstance.dialogRef = dialogRef;

    tick(1500);
    expect(form.valid).toBeFalsy();

    // Gather the same JS reference from the component to avoid 'ObjectNotFound' validator errors
    const natureValidValue: NatureRefus = componentInstance.natures[0];
    natureControl.setValue(natureValidValue);
    const intituleValue = 'Ceci est un motif valide';
    motifControl.setValue(intituleValue);

    expect(form.valid).toBeTruthy();

    dossierService = fixture.debugElement.injector.get(DossierService);
    const spyOnSubmit = spyOn(dossierService, 'refuseDossier').and.callThrough();

    expect(spyOnSubmit.calls.any()).toBe(false, 'the service haven\'t been called yet');

    componentInstance.onSubmit();

    expect(spyOnSubmit.calls.any()).toBe(true, 'the service have been called');
  }));

  it('should close a dialog and get back a result and return false', fakeAsync(() => {
    const dialogRef = dialog.open(RefuseDossierPopupComponent);
    const afterCloseCallback = jasmine.createSpy('afterClose callback');
    componentInstance.dialogRef = dialogRef;
    componentInstance.dialogRef.afterClosed().subscribe(afterCloseCallback);
    componentInstance.onNoClick();
    viewContainerFixture.detectChanges();
    flush();
    expect(afterCloseCallback).toHaveBeenCalledWith(false);
    expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeNull();
  }));

  it('should close a dialog and get back a result and return true', fakeAsync(() => {
    const dialogRef = dialog.open(RefuseDossierPopupComponent);
    const afterCloseCallback = jasmine.createSpy('afterClose callback');
    componentInstance.dialogRef = dialogRef;
    componentInstance.dialogRef.afterClosed().subscribe(afterCloseCallback);
    componentInstance.onSubmit();
    viewContainerFixture.detectChanges();
    flush();
    expect(afterCloseCallback).toHaveBeenCalledWith(true);
    expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeNull();
  }));
});

// tslint:disable-next-line:directive-selector
@Directive({ selector: 'dir-with-view-container' })
class WithViewContainerDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({
  selector: 'siga-arbitrary-component',
  template: `<dir-with-view-container></dir-with-view-container>`,
})

export class WithChildViewContainerComponent {
  @ViewChild(WithViewContainerDirective) childWithViewContainer: WithViewContainerDirective;

  get childViewContainer() {
    return this.childWithViewContainer.viewContainerRef;
  }
}

// Create a real (non-test) NgModule as a workaround for
const TEST_DIRECTIVES = [
  WithChildViewContainerComponent,
  WithViewContainerDirective,
  RefuseDossierPopupComponent
];

@NgModule({
  imports: [MatDialogModule, NoopAnimationsModule, TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient],
    }
  }),
    CommonModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    HttpClientModule
  ],
  exports: TEST_DIRECTIVES,
  declarations: TEST_DIRECTIVES,
  entryComponents: [
    WithChildViewContainerComponent,
    RefuseDossierPopupComponent
  ],
})
class DialogTestModule { }
