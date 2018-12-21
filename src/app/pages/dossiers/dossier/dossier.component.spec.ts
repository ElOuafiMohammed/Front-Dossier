import {
  TestBed,
  ComponentFixture,
  async,
  inject
} from "@angular/core/testing";
import { CommonModule } from "@angular/common";
import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/from";
import {
  MatDialogRef,
  DateAdapter,
  MAT_DATE_LOCALE,
  MatDatepicker,
  MatNativeDateModule,
  MatAutocompleteModule,
  MAT_DATE_FORMATS
} from "@angular/material";
import { ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FlexLayoutModule } from "@angular/flex-layout";
import { RouterTestingModule } from "@angular/router/testing";
import {
  MatMomentDateModule,
  MomentDateAdapter
} from "@angular/material-moment-adapter";
import { MaterialModule } from "app/theme/material/material.module";

import { DossierComponent } from "./dossier.component";
import { PrevisionnelComponent } from "./previsionnel/previsionnel.component";
import { Dossier } from "./../dossiers.interface";
import {
  OrigineDemande,
  NiveauPriorite,
  ProcedureDecision,
  NatureOperation
} from "./dossier.interface";

import { DossierService } from "./../dossiers.service";
import { DossierServiceStub } from "../dossiers.service.spec";
import { TranslateModule } from "@ngx-translate/core";

import { CanDeactivateGuardDossier } from "app/core/injectables/can-deactivate-guard.service";
import { MY_FORMATS } from "../../../app.module";
import { FormatMonetairePipe } from "app/theme/pipes/formatMonetaire/format-monetaire.pipe";
import { SpinnerLuncher } from "../../../shared/methodes-generiques";
import { SpinnerLuncherStub } from "../../../shared/test.helper";

describe("DossierComponent", () => {
  describe("Unit Test of DossierComponent", () => {
    let componentInstance: DossierComponent;
    let fixture: ComponentFixture<DossierComponent>;
    let dossierService: DossierService;

    const mockRouter = {
      navigate: jasmine.createSpy("navigate")
    };
    let pipe: FormatMonetairePipe;
    beforeEach(async(() => {
      pipe = new FormatMonetairePipe();
      TestBed.configureTestingModule({
        imports: [
          CommonModule,
          BrowserAnimationsModule,
          ReactiveFormsModule,
          MaterialModule,
          FlexLayoutModule,
          RouterTestingModule,
          MatMomentDateModule,
          TranslateModule.forRoot()
        ],
        declarations: [DossierComponent, FormatMonetairePipe],
        providers: [
          CanDeactivateGuardDossier,
          { provide: DossierService, useClass: DossierServiceStub },
          { provide: MatDialogRef, useValue: {} },
          {
            provide: ActivatedRoute,
            useValue: { params: Observable.from([{ dossierId: 1 }]) }
          },
          { provide: Router, useValue: mockRouter },
          { provide: MAT_DATE_LOCALE, useValue: "fr" },
          {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE]
          },
          { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
          { provide: FormatMonetairePipe, useValue: pipe },
          { provide: SpinnerLuncher, useClass: SpinnerLuncherStub }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
    }));
    beforeEach(() => {
      fixture = TestBed.createComponent(DossierComponent);
      componentInstance = fixture.componentInstance;
      fixture.detectChanges();
    });
    it("should create component", () => {
      expect(componentInstance).toBeTruthy();
    });

    it("should have a valid form by default", () => {
      // expect(componentInstance.formUpdateDossier.valid).toBeTruthy();
    });

    it("should get a Dossier from the route parameter dossierId", () => {
      dossierService = fixture.debugElement.injector.get(DossierService);

      let fakeDossier: Dossier = null;
      dossierService
        .getDossier(1)
        .subscribe(dossier => (fakeDossier = dossier));

      const spyGetDossier = spyOn(
        dossierService,
        "getDossier"
      ).and.callThrough();
      expect(spyGetDossier.calls.count()).toBe(0);

      componentInstance.ngOnInit();

      // Expect the dossier ID argument to be 1
      expect(spyGetDossier.calls.allArgs()[0][0]).toBe(1);
      expect(spyGetDossier.calls.count()).toBe(1);
      expect(dossierService.dossier.id).toBe(fakeDossier.id);
    });

    it("should call #getNatureOperation", () => {
      dossierService = fixture.debugElement.injector.get(DossierService);
      const spyGetNatureOperation = spyOn(
        dossierService,
        "getNatureOperation"
      ).and.callThrough();
      expect(spyGetNatureOperation.calls.count()).toBe(0);

      componentInstance.ngOnInit();

      expect(spyGetNatureOperation.calls.count()).toBe(1);
    });

    it("should manage an valid operation field value", () => {
      const form = componentInstance.formUpdateDossier;
      const naturesOperationControl = componentInstance.naturesOperationControl;
      const natureOperationValidatorKey =
        componentInstance.natureOperationValidatorKey;

      expect(naturesOperationControl.errors).toBeNull();
      // expect(form.valid).toBeTruthy();

      const natureValue: NatureOperation = {
        id: 0,
        ligne: "ligne",
        numero: "numero",
        libelle: "Invalid thématique",
        codeThematique: "AEEP"
      };
      naturesOperationControl.setValue(natureValue);
      componentInstance.ngOnInit();
      expect(
        naturesOperationControl.hasError(natureOperationValidatorKey)
      ).toBeFalsy();
    });

    it("should call #basculer", () => {
      dossierService = fixture.debugElement.injector.get(DossierService);
      let fakeDossier: Dossier = null;
      dossierService
        .getDossier(1)
        .subscribe(dossier => (fakeDossier = dossier));

      const spyClickBasculer = spyOn(
        dossierService,
        "basculer"
      ).and.callThrough();
      expect(spyClickBasculer.calls.count()).toBe(0);
      componentInstance.basculer();

      expect(spyClickBasculer.calls.count()).toBe(0);
      componentInstance.ngOnInit();
      // Expect the dossier ID argument to be 1
      // expect(spyClickBasculer.calls.allArgs()[0][0]).toBe(0);
      expect(dossierService.dossier.id).toBe(fakeDossier.id);
      expect(dossierService.dossier.phase).toBe("P00");
    });

    it("should call #valider", () => {
      dossierService = fixture.debugElement.injector.get(DossierService);
      let fakeDossier: Dossier = null;
      dossierService
        .getDossier(1)
        .subscribe(dossier => (fakeDossier = dossier));

      const spyClickValider = spyOn(
        dossierService,
        "valider"
      ).and.callThrough();
      expect(spyClickValider.calls.count()).toBe(0);
      componentInstance.valider();

      expect(spyClickValider.calls.count()).toBe(0);
      // componentInstance.ngOnInit();
      // Expect the dossier ID argument to be 1
      // expect(spyClickValider.calls.allArgs()[0][0]).toBe(1);
      expect(dossierService.dossier.id).toBe(fakeDossier.id);
      expect(dossierService.dossier.phase).toBe("P00");
    });

    it("should call #devalider", () => {
      dossierService = fixture.debugElement.injector.get(DossierService);
      let fakeDossier: Dossier = null;
      dossierService
        .getDossier(1)
        .subscribe(dossier => (fakeDossier = dossier));
      const spyClickDevalider = spyOn(
        dossierService,
        "devalider"
      ).and.callThrough();
      expect(spyClickDevalider.calls.count()).toBe(0);
      componentInstance.devalider();

      expect(spyClickDevalider.calls.count()).toBe(0);
      componentInstance.ngOnInit();
      // Expect the dossier ID argument to be 1
      // expect(spyClickDevalider.calls.allArgs()[0][0]).toBe(1);
      expect(dossierService.dossier.id).toBe(fakeDossier.id);
      expect(dossierService.dossier.phase).toBe("P00");
    });

    it("should call #getOrigineDemande", () => {
      dossierService = fixture.debugElement.injector.get(DossierService);
      const spyGetOrigineDemande = spyOn(
        dossierService,
        "getOrigineDemande"
      ).and.callThrough();
      expect(spyGetOrigineDemande.calls.count()).toBe(0);

      componentInstance.ngOnInit();
      // @see DossierServiceStub #getDossier() => it calls all the methods
      expect(spyGetOrigineDemande.calls.count()).toBe(2);
    });

    xit("should call #getProcedureDecisions", () => {
      dossierService = fixture.debugElement.injector.get(DossierService);
      const spyGetProcedureDecisions = spyOn(
        dossierService,
        "getProcedureDecisions"
      ).and.callThrough();
      expect(spyGetProcedureDecisions.calls.count()).toBe(0);

      componentInstance.ngOnInit();
      // @see DossierServiceStub #getDossier() => it calls all the methods
      expect(spyGetProcedureDecisions.calls.count()).toBe(1);
    });

    xit("should call #getNiveauPriorite", () => {
      dossierService = fixture.debugElement.injector.get(DossierService);
      const spyGetNiveauPriorite = spyOn(
        dossierService,
        "getNiveauPriorite"
      ).and.callThrough();
      expect(spyGetNiveauPriorite.calls.count()).toBe(0);

      componentInstance.ngOnInit();
      // @see DossierServiceStub #getDossier() => it calls all the methods
      expect(spyGetNiveauPriorite.calls.count()).toBe(1);
    });

    xit("should call #getDomaines", () => {
      dossierService = fixture.debugElement.injector.get(DossierService);
      const spyGetDomaines = spyOn(
        dossierService,
        "getDomaines"
      ).and.callThrough();
      expect(spyGetDomaines.calls.count()).toBe(0);

      componentInstance.ngOnInit();
      // @see DossierServiceStub #getDossier() => it calls all the methods
      expect(spyGetDomaines.calls.count()).toBe(1);
    });

    xit("should manage an invalid NiveauPriorite field value", () => {
      const form = componentInstance.formUpdateDossier;
      const prioriteControl = componentInstance.prioriteControl;
      const prioriteValidatorKey = componentInstance.prioriteValidatorKey;

      expect(prioriteControl.errors).toBeNull();
      // expect(form.valid).toBeTruthy();

      const niveauPrioriteInvalidValue: NiveauPriorite = {
        id: 0,
        code: "INVA",
        libelle: "Invalid thématique"
      };
      prioriteControl.setValue(niveauPrioriteInvalidValue);

      expect(prioriteControl.hasError(prioriteValidatorKey)).toBeFalsy();
    });

    xit("should manage an invalid OrigineDemande field value", () => {
      const form = componentInstance.formUpdateDossier;
      const origineDemandeControl = componentInstance.origineDemandeControl;
      const origineDemandeValidatorKey =
        componentInstance.origineDemandeValidatorKey;

      expect(origineDemandeControl.errors).toBeNull();
      // expect(form.valid).toBeTruthy();

      const origineDemandeInvalidValue: OrigineDemande = {
        id: 0,
        code: "OOR",
        libelle: "Invalid origine demande"
      };
      origineDemandeControl.setValue(origineDemandeInvalidValue);

      expect(
        origineDemandeControl.hasError(origineDemandeValidatorKey)
      ).toBeFalsy();
    });

    xit("should manage an invalid SessionDecision field value", () => {
      const form = componentInstance.formUpdateDossier;
      const sessionControl = componentInstance.procedureControl;
      const sessionValidatorKey = componentInstance.procedureValidatorKey;

      expect(sessionControl.errors).toBeNull();
      // expect(form.valid).toBeTruthy();

      const sessionInvalidValue: ProcedureDecision = {
        id: 0,
        code: "CI",
        libelle: "SESSION"
      };
      sessionControl.setValue(sessionInvalidValue);

      expect(sessionControl.hasError(sessionValidatorKey)).toBeFalsy();
    });
    it("should manage an invalid date Demande field value", () => {
      const form = componentInstance.formUpdateDossier;
      const dateDemandeControl = componentInstance.dateDemandeControl;

      expect(dateDemandeControl.errors).toBeNull();
      // expect(form.valid).toBeTruthy();

      const dateInvalidValue = "fffff";
      dateDemandeControl.setValue(dateInvalidValue);
      expect(dateDemandeControl.errors["matDatepickerParse"]).toBeTruthy();

      const dateInvalidValueMin = new Date(1949, 1);
      dateDemandeControl.setValue(dateInvalidValueMin);
      expect(dateDemandeControl.errors["matDatepickerMin"]).toBeTruthy();

      const dateInvalidValueMax = new Date();
      dateInvalidValueMax.setMonth(dateInvalidValueMax.getMonth() + 1);
      dateDemandeControl.setValue(dateInvalidValueMax);
      expect(dateDemandeControl.errors["matDatepickerMax"]).toBeTruthy();
      expect(form.valid).toBeFalsy();
    });

    it("should manage an invalid date complet field value", () => {
      const form = componentInstance.formUpdateDossier;
      const dateCompletControl = componentInstance.dateCompletControl;
      const dateDemandeControl = componentInstance.dateDemandeControl;
      expect(dateCompletControl.errors).toBeNull();
      // expect(form.valid).toBeTruthy();
      const dateInvalidValue = "fffff";
      dateCompletControl.setValue(dateInvalidValue);
      expect(dateCompletControl.errors["matDatepickerParse"]).toBeTruthy();
      dateDemandeControl.setValue(new Date(1949, 1));

      const dateInvalidValueMin = new Date(1949, 1);
      dateCompletControl.setValue(dateInvalidValueMin);

      const dateInvalidValueMax = new Date();
      dateInvalidValueMax.setMonth(dateInvalidValueMax.getMonth() + 1);
      dateCompletControl.setValue(dateInvalidValueMax);
      expect(dateCompletControl.errors["matDatepickerMax"]).toBeTruthy();
      expect(form.valid).toBeFalsy();
    });

    it("should manage an invalid Intitule field value", () => {
      const form = componentInstance.formUpdateDossier;
      const intituleControl = componentInstance.intituleControl;

      expect(intituleControl.errors).toBeNull();

      const intituleInvalidValue =
        "01234567890123456789012345678901234567890123456789012345678901234567890123456789e";
      intituleControl.setValue(intituleInvalidValue);

      expect(intituleControl.errors["maxlength"]).toBeTruthy();
      expect(form.valid).toBeFalsy();
    });

    it("should manage an invalid Numero Beneficiaire field value", () => {
      const form = componentInstance.formUpdateDossier;
      const benefNumberControl = componentInstance.benefNumberControl;
      let benef_numberInvalidValue = null;
      benefNumberControl.setValue("");

      expect(benefNumberControl.hasError("required")).toBeTruthy();
      expect(form.valid).toBeFalsy();
      benef_numberInvalidValue = "12345678ee";
      benefNumberControl.setValue(benef_numberInvalidValue);
      expect(form.valid).toBeFalsy();
      benef_numberInvalidValue = "00000000P";
      benefNumberControl.setValue(benef_numberInvalidValue);
      expect(form.valid).toBeTruthy();
    });

    it("should manage the disabled Libelle Beneficiaire field value", () => {
      const benefLibelleControl = componentInstance.benefLibelleControl;

      expect(benefLibelleControl.disabled).toBeTruthy();
      expect(benefLibelleControl.errors).toBeNull();
    });

    it("should manage the disabled Phase field value", () => {
      const form = componentInstance.formUpdateDossier;
      const phaseControl = componentInstance.phaseControl;

      expect(phaseControl.disabled).toBeTruthy();
      // Disabled field does not triggers require validator
      expect(phaseControl.errors).toBeNull();
      // expect(form.valid).toBeTruthy();
    });

    it("should test the link between Numero Beneficiaire and Libelle Beneficiaire fields", () => {
      const benefNumberControl = componentInstance.benefNumberControl;
      const benefLibelleControl = componentInstance.benefLibelleControl;
      const benefNumberInvalidValue = "12345678ee";
      benefNumberControl.setValue(benefNumberInvalidValue);
      expect(benefLibelleControl.value).toBe("");
      expect(benefLibelleControl.disabled).toBeTruthy();
      const benefNumberValidValue = "00000000P";
      benefNumberControl.setValue(benefNumberValidValue);
      expect(benefLibelleControl.value).toBe("raison sociale de 01234567M");
      expect(benefLibelleControl.disabled).toBeTruthy();
    });

    // WIP - Doesn't work
    // TODO : Apply this logic to the integration test suite under this suite.
    it("should allow screen deactivate when nothing was done #close", inject(
      [CanDeactivateGuardDossier],
      (guard: any) => {
        expect(mockRouter.navigate).toHaveBeenCalledTimes(0);
        const spyCanDeactivate = spyOn(
          componentInstance,
          "canDeactivate"
        ).and.callThrough();
        expect(spyCanDeactivate.calls.count()).toBe(0);

        componentInstance.close();
        componentInstance.ngOnInit();
        expect(spyCanDeactivate.calls.count()).toBe(
          0,
          "#close() should trigger #canDeactivate() guard"
        );
        expect(mockRouter.navigate).toHaveBeenCalledTimes(1);

        const canDeactivateResult = componentInstance.canDeactivate();
        expect(canDeactivateResult).toBeTruthy();
      }
    ));

    it("should call the updateDossier service when the form is valid", () => {
      const form = componentInstance.formUpdateDossier;

      const origineDemandeControl = componentInstance.origineDemandeControl;
      const benefNumberControl = componentInstance.benefNumberControl;
      const intituleControl = componentInstance.intituleControl;
      const dateDemandeControl = componentInstance.dateDemandeControl;
      const benefLibelleControl = componentInstance.benefLibelleControl;
      const phaseControl = componentInstance.phaseControl;
      const sessionControl = componentInstance.procedureControl;

      dossierService = fixture.debugElement.injector.get(DossierService);
      // expect(form.valid).toBeTruthy();

      dossierService
        .getDomaines()
        .map(domaines => (componentInstance.domaines = domaines[0]));
      const spyOnSubmit = spyOn(
        dossierService,
        "updateDossier"
      ).and.callThrough();
      expect(spyOnSubmit.calls.count()).toBe(0);

      componentInstance.onSubmit();

      expect(spyOnSubmit.calls.count()).toBe(1);

      // Gather the same JS reference from the component to avoid 'ObjectNotFound' validator errors
      const origineValidValue: OrigineDemande = {
        id: 0,
        code: "OOR",
        libelle: "Invalid origine demande"
      };
      origineDemandeControl.setValue(origineValidValue);
      const intituleValue = "Ceci est un libellé valide";
      intituleControl.setValue(intituleValue);
      const benefNumberValue = "01234567M";
      benefNumberControl.setValue(benefNumberValue);
      const datevalidValue = new Date("March 01, 2018 00:00:00");
      dateDemandeControl.setValue(datevalidValue);
      // expect(form.valid).toBeTruthy();

      componentInstance.onSubmit();
      expect(spyOnSubmit.calls.count()).toBe(2);
    });
  });

  describe("Integration Test of DossierComponent", () => {
    let componentInstance: DossierComponent;
    let fixture: ComponentFixture<DossierComponent>;
    // let dossierService: DossierService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          CommonModule,
          BrowserAnimationsModule,
          ReactiveFormsModule,
          MaterialModule,
          FlexLayoutModule,
          RouterTestingModule,
          MatMomentDateModule,
          TranslateModule.forRoot()
        ],
        declarations: [DossierComponent, PrevisionnelComponent],
        providers: [
          { provide: DossierService, useClass: DossierServiceStub },
          {
            provide: MatDialogRef,
            useValue: {}
          },
          { provide: MAT_DATE_LOCALE, useValue: "fr" },
          {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE]
          },
          { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
          { provide: FormatMonetairePipe },
          { provide: SpinnerLuncher, useClass: SpinnerLuncherStub }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      });

      fixture = TestBed.createComponent(DossierComponent);
      componentInstance = fixture.componentInstance;
      fixture.detectChanges();
    });

    it("should create component", () => {
      expect(componentInstance).toBeTruthy();
    });
  });
});
