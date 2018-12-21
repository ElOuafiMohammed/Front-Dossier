import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { InputReferenceInterlocuteurComponent } from "./input-reference-interlocuteur.component";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "app/theme/material/material.module";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatInputModule } from "@angular/material";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {
  HttpClientTestingModule,
  HttpTestingController
} from "@angular/common/http/testing";
import { TranslateModule } from "@ngx-translate/core";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { DossierService } from "app/pages/dossiers/dossiers.service";
import { DossierServiceStub } from "app/pages/dossiers/dossiers.service.spec";
import { HttpClient } from "@angular/common/http";

describe("InputReferenceInterlocuteurComponent", () => {
  let component: InputReferenceInterlocuteurComponent;
  let fixture: ComponentFixture<InputReferenceInterlocuteurComponent>;
  let dossierService: DossierService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        CommonModule,
        MaterialModule,
        FlexLayoutModule,
        MatInputModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      declarations: [InputReferenceInterlocuteurComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: HttpClient, HttpTestingController }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputReferenceInterlocuteurComponent);
    component = fixture.componentInstance;
    dossierService = fixture.debugElement.injector.get(DossierService);

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should manage an invalid Numero Beneficiaire field value", () => {
    const form = component.formCorrespondant;
    const benefNumberControl = component.referenceCorrespControl;
    let benefNumberInvalidValue = null;

    benefNumberInvalidValue = "12345678ee";
    benefNumberControl.setValue(benefNumberInvalidValue);

    expect(benefNumberControl.errors["maxlength"]).toBeTruthy();
    expect(benefNumberControl.errors["pattern"]).toBeTruthy();

    benefNumberInvalidValue = "123456780";
    benefNumberControl.setValue(benefNumberInvalidValue);

    expect(benefNumberControl.errors["maxlength"]).toBeFalsy();
    expect(benefNumberControl.errors["pattern"]).toBeTruthy();
    expect(form.valid).toBeFalsy();
  });

  it("should emit the formCorrespondant when some data is updated", () => {
    const referenceCorrespControl = component.referenceCorrespControl;
    const spyNotifyParent = spyOn(
      component.notifyCheckParentComponent,
      "emit"
    ).and.callThrough();
    expect(spyNotifyParent.calls.any()).toBe(false);

    const spyNotifyParentUpdate = spyOn(
      component.updateCorrespondantEvent,
      "emit"
    ).and.callThrough();
    expect(spyNotifyParent.calls.any()).toBe(false);

    const refBenefValidValue = "00000000A";
    referenceCorrespControl.setValue(refBenefValidValue);
    component.onBlur();

    expect(dossierService.getBeneficaire).toHaveBeenCalled;

    dossierService
      .getBeneficaire(referenceCorrespControl.value)
      .subscribe(data => {
        component.rowData.referenceCorresp = data.reference;
        expect(spyNotifyParent.calls.any()).toBe(true);
        expect(spyNotifyParent.calls.count()).toBe(1);
        expect(component.rowData.correspondant).toEqual(data);

        expect(spyNotifyParentUpdate.calls.any()).toBe(true);
        expect(spyNotifyParentUpdate.calls.count()).toBe(1);
      });
  });
});
