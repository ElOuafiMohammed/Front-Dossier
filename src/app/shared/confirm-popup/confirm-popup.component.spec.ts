import {
  ComponentFixture,
  fakeAsync,
  inject,
  TestBed,
  flush,
  tick
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
import { Location } from '@angular/common';
import { SpyLocation } from '@angular/common/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MatTooltipModule,
  MAT_DIALOG_DATA,
} from '@angular/material'

import { ConfirmPopupComponent } from './confirm-popup.component'
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../theme/material/material.module';


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
  ConfirmPopupComponent
];

@NgModule({
  imports: [MatDialogModule, NoopAnimationsModule],
  exports: TEST_DIRECTIVES,
  declarations: TEST_DIRECTIVES,
  entryComponents: [
    WithChildViewContainerComponent,
    ConfirmPopupComponent
  ],
  schemas: [
    NO_ERRORS_SCHEMA
  ],
})
class DialogTestModule { }

/**
 * Unit Test of ConfirmPopupComponent
 */
describe('Unit Test of ConfirmPopupComponent', () => {
  let dialog: MatDialog;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<WithChildViewContainerComponent>;
  let mockLocation: SpyLocation;
  let dialogRef: MatDialogRef<ConfirmPopupComponent>;
  let component: ConfirmPopupComponent;
  let fixture: ComponentFixture<ConfirmPopupComponent>;
  const afterCloseCallback = jasmine.createSpy('afterClose callback');

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, MaterialModule, DialogTestModule, BrowserAnimationsModule],
      providers: [
        { provide: Location, useClass: SpyLocation },
        {
          provide: MatDialogRef, useValue: {}
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: Router, useValue: {} },
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    });
    TestBed.compileComponents();
  }));

  beforeEach(inject([MatDialog, Location, OverlayContainer],
    (d: MatDialog, l: Location, oc: OverlayContainer) => {
      dialog = d;
      mockLocation = l as SpyLocation;
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
      dialogRef = dialog.open(ConfirmPopupComponent);
      dialogRef.componentInstance.dialogRef.afterClosed().subscribe(afterCloseCallback);
    }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(WithChildViewContainerComponent);
    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
    fixture = TestBed.createComponent(ConfirmPopupComponent);
    component = fixture.componentInstance;
    component.data.typeAction = 'update';
    component.data.valueStatusError = false;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.data.typeAction).toBe('update');
    expect(component.data.valueStatusError).toBe(false);
  });

  /**
 * Should return a string that is a color of button cancel
 */
  it('#styleFocusCancel Should return a string that is a color of button cancel', fakeAsync(() => {
    spyOn(component, 'styleFocusCancel').and.callThrough();
    fixture.detectChanges();
    tick();
    expect(component.styleFocusCancel()).toEqual({ 'background-color': 'white' });
  }));

  /**
  * StyleFocusSave Should return a string that is a color of button save
  */
  it('#StyleFocusSave Should return a string that is a color of button save', fakeAsync(() => {
    spyOn(component, 'styleFocusSave').and.callThrough();
    fixture.detectChanges();
    tick();
    expect(component.styleFocusSave()).toEqual({ 'background-color': 'rgb(32,158,145)' });
  }));


  /**
  * TooltipChangeValue Should return a string that is the text of tooltip
  */
  it('#tooltipChangeValue Should return a string that is a color of button save', fakeAsync(() => {
    spyOn(component, 'tooltipChangeValue').and.callThrough();
    fixture.detectChanges();
    tick();
    expect(component.tooltipChangeValue()).toString();
  }));
});

