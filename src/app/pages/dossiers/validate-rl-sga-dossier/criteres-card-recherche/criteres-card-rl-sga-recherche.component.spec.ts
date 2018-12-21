import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';

import { NgaModule } from 'app/theme/nga.module';

import { Thematique } from '../../create-dossier/create-dossier.interface';

import { DossierService } from '../../dossiers.service';
import { DossierServiceStub } from '../../dossiers.service.spec';
import { Delegation } from 'app/pages/dossiers/validate-dossier/validate-dossier.interface';
import { ProcedureDecision, NiveauPriorite, Domaine } from '../../dossier/dossier.interface';
import { TranslateModule } from '@ngx-translate/core';
import { CritereCardRlSgaRechercheComponent } from 'app/pages/dossiers/validate-rl-sga-dossier/criteres-card-recherche/criteres-card-rl-sga-recherche.component';
import { SpinnerLuncher } from '../../../../shared/methodes-generiques';
import { SpinnerLuncherStub } from '../../../../shared/test.helper';

describe('CritereCardRlSgaRechercheComponent', () => {

  let componentInstance: CritereCardRlSgaRechercheComponent;
  let fixture: ComponentFixture<CritereCardRlSgaRechercheComponent>;
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
          CritereCardRlSgaRechercheComponent,
        ],
        schemas: [
          NO_ERRORS_SCHEMA
        ],
        providers: [
          { provide: DossierService, useClass: DossierServiceStub },
          { provide: SpinnerLuncher, useCLass: SpinnerLuncherStub }
        ]
      });

      fixture = TestBed.createComponent(CritereCardRlSgaRechercheComponent);
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

    it('should manage an invalid Delegation field value', () => {
      const form = componentInstance.formCritere;
      const delegationControl = componentInstance.delegationControl;
      const delegationsValidatorKey = componentInstance.delegationsValidatorKey;
      componentInstance.delegations = dossierService.getDelegation();

      componentInstance.ngOnChanges();
      const delegationInvalidValue: Delegation = { id: 0, code: '', libelle: 'Delegation inconnu' };
      delegationControl.setValue(delegationInvalidValue);

      expect(delegationControl.errors[delegationsValidatorKey]).toBeTruthy();
      expect(form.valid).toBeFalsy();
    });

    it('should manage an invalid Domaine field value', () => {
      const form = componentInstance.formCritere;
      const domaineControl = componentInstance.domaineControl;
      const domaineValidatorKey = componentInstance.domaineValidatorKey;
      componentInstance.domaines = dossierService.getDomaines();
      componentInstance.ngOnChanges();

      const domaineInvalidValue: Domaine = { id: 0, code: 'INVA', libelle: 'Invalid domaine' };
      domaineControl.setValue(domaineInvalidValue);

      expect(domaineControl.errors[domaineValidatorKey]).toBeTruthy();
      expect(form.valid).toBeFalsy();
    });

    it('should manage an invalid Procedure  decision field value', () => {
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

    it('should manage an invalid NiveauPriorite field value', () => {
      const form = componentInstance.formCritere;
      const prioriteControl = componentInstance.prioriteControl;
      const prioriteValidatorKey = componentInstance.prioriteValidatorKey;

      componentInstance.priorites = dossierService.getNiveauPriorite();
      componentInstance.ngOnChanges();

      const niveauPrioriteInvalidValue: NiveauPriorite = { id: 0, code: 'INVA', libelle: 'Invalid priorite' };
      prioriteControl.setValue(niveauPrioriteInvalidValue);

      expect(prioriteControl.errors[prioriteValidatorKey]).toBeTruthy();
      expect(form.valid).toBeFalsy();
    });

    it('onSubmit should return emmit the proper object', () => {
      spyOn(componentInstance.searchEventEmitter, 'emit');
      componentInstance.onSubmit(false);
      expect(componentInstance.searchEventEmitter.emit).toHaveBeenCalledWith({
        thematique: null,
        domaine: null,

        responsableTech: null,
        phase: 'T20',
        priorite: null,
        procedureDecision: null,
        codeServiceDept: null,
        departement: null,
        numeroIncrement: null,
        codeBenef: null,
        pageAAficher: null,
        delegation: null,
        nbElemPerPage: 100000,
        devaliderSiege: false,
        natureOperation: null,
        hasReponseNontraite: null
      });
    });

  });
});
