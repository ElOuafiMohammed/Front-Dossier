import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';

import { NgaModule } from 'app/theme/nga.module';



import { Delegation } from 'app/pages/dossiers/validate-dossier/validate-dossier.interface';
import { TranslateModule } from '@ngx-translate/core';

import { CritereCardSignerRechercheComponent } from 'app/pages/dossiers/suivre-dossier/verifier-signer-dossier/criteres-card-recherche/criteres-card-signer-recherche.component';
import { SpinnerLuncherStub } from 'app/shared/test.helper';
import { SpinnerLuncher } from 'app/shared/methodes-generiques';
import { ResponsableTechnique, Thematique } from 'app/pages/dossiers/create-dossier/create-dossier.interface';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { DossierServiceStub } from 'app/pages/dossiers/dossiers.service.spec';
import { ProcedureDecision } from 'app/pages/dossiers/dossier/dossier.interface';

describe('CritereCardSignerRechercheComponent', () => {

  let componentInstance: CritereCardSignerRechercheComponent;
  let fixture: ComponentFixture<CritereCardSignerRechercheComponent>;
  let dossierService: DossierService;

  describe('unit tests => ', () => {

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          BrowserAnimationsModule,
          NgaModule.forRoot(),
          TranslateModule.forRoot()
        ],
        declarations: [
          CritereCardSignerRechercheComponent,
        ],
        schemas: [
          NO_ERRORS_SCHEMA
        ],
        providers: [
          { provide: DossierService, useClass: DossierServiceStub },
          { provide: SpinnerLuncher, useCLass: SpinnerLuncherStub }
        ]
      });

      fixture = TestBed.createComponent(CritereCardSignerRechercheComponent);
      componentInstance = fixture.componentInstance;
      fixture.detectChanges();
      dossierService = fixture.debugElement.injector.get(DossierService);
    });

    it('should create component', () => {
      expect(componentInstance).toBeTruthy();
    });

    it('should have an invalid form by default (empty)', () => {
      expect(componentInstance.formCritere.valid).toBeFalsy();
    });

    it('should manage an invalid Thematique field value', () => {
      const form = componentInstance.formCritere;
      const thematiqueControl = componentInstance.thematiqueControl;
      const thematiqueValidatorKey = componentInstance.thematiqueValidatorKey;
      componentInstance.thematiques = dossierService.getThematiques();
      componentInstance.ngOnChanges();

      const thematiqueInvalidValue: Thematique = { id: 0, code: 'INVA', libelle: 'Invalid thématique' };
      thematiqueControl.setValue(thematiqueInvalidValue);

      expect(thematiqueControl.errors[thematiqueValidatorKey]).toBeTruthy();
      expect(form.valid).toBeFalsy();
    });

    it('should manage an invalid Responsable Technique field value', () => {
      const form = componentInstance.formCritere;
      const respTechControl = componentInstance.respTechControl;
      const respTechValidatorKey = componentInstance.respTechValidatorKey;
      dossierService.getResponsableTech().subscribe(
        (data) => {
          componentInstance.responsablesTech = data;
        })
      componentInstance.ngOnChanges();

      const responsableTechInvalidValue: ResponsableTechnique = {
        login: '',
        prenom: 'INVA',
        nom: 'Invalid responsalbe technique',
        email: null,
        telephone: null,
        organisation: null
      };
      respTechControl.setValue(responsableTechInvalidValue);
      expect(respTechControl.errors[respTechValidatorKey]).toBeTruthy();
      expect(form.valid).toBeFalsy();
    });

    it('should manage an invalid Procedure decision field value', () => {
      const form = componentInstance.formCritere;
      const procedureDecisionsControl = componentInstance.procedureDecisionsControl;
      const procedureValidatorKey = componentInstance.procedureValidatorKey;
      componentInstance.procedureDecisions = dossierService.getProcedureDecisions();
      componentInstance.ngOnChanges();

      const procedureDecisionInvalidValue: ProcedureDecision = { id: 0, code: '', libelle: 'Invalid procedure decision' };
      procedureDecisionsControl.setValue(procedureDecisionInvalidValue);
      expect(procedureDecisionsControl.errors[procedureValidatorKey]).toBeTruthy();
      expect(form.valid).toBeFalsy();
    });

    it('onSubmit should return emmit the proper object', () => {
      spyOn(componentInstance.searchEventEmitter, 'emit');
      componentInstance.onSubmit(false);
      expect(componentInstance.searchEventEmitter.emit).toHaveBeenCalledWith({
        thematique: null,
        phase: 'A05',
        procedureDecision: null,
        numeroIncrement: null,
        codeThematique: null,
        departement: null,
        dateAttribution: null,
        loginResponsableAdm: null,
        session: null,
        isSigne: false,
        nbElemPerPage: 100000
      });
    });

  });
});
