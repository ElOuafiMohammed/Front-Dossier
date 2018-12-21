import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';

import { NgaModule } from 'app/theme/nga.module';

import { Thematique, ResponsableTechnique } from '../../create-dossier/create-dossier.interface';

import { DossierService } from '../../dossiers.service';
import { DossierServiceStub } from '../../dossiers.service.spec';
import { CritereCardRechercheComponent } from 'app/pages/dossiers/validate-dossier/criteres-card-recherche/criteres-card-recherche.component';
import { Delegation } from 'app/pages/dossiers/validate-dossier/validate-dossier.interface';
import { ProcedureDecision, NiveauPriorite } from '../../dossier/dossier.interface';
import { TranslateModule } from '@ngx-translate/core';
import { SpinnerLuncher } from '../../../../shared/methodes-generiques';
import { SpinnerLuncherStub } from '../../../../shared/test.helper';

describe('CritereCardRechercheComponent', () => {

  let componentInstance: CritereCardRechercheComponent;
  let fixture: ComponentFixture<CritereCardRechercheComponent>;
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
          CritereCardRechercheComponent,
        ],
        schemas: [
          NO_ERRORS_SCHEMA
        ],
        providers: [
          { provide: DossierService, useClass: DossierServiceStub },
          { provide: SpinnerLuncher, useClass: SpinnerLuncherStub }
        ]
      });

      fixture = TestBed.createComponent(CritereCardRechercheComponent);
      componentInstance = fixture.componentInstance;
      fixture.detectChanges();
      dossierService = fixture.debugElement.injector.get(DossierService);
    });

    it('should create component', () => {
      expect(componentInstance).toBeTruthy();
    });

    it('should have an valid form by default (empty)', () => {
      expect(componentInstance.formCritere.valid).toBeTruthy();
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

    it('should manage an invalid Delegation field value', fakeAsync(() => {
      const form = componentInstance.formCritere;
      const delegationControl = componentInstance.delegationControl;
      const delegationsValidatorKey = componentInstance.delegationsValidatorKey;
      componentInstance.delegations = dossierService.getDelegation();

      componentInstance.ngOnChanges();

      const delegationInvalidValue: Delegation = { id: 0, code: '', libelle: 'Delegation inconnu' };
      delegationControl.setValue(delegationInvalidValue);

      fixture.whenStable().then(() => {
        expect(delegationControl.errors[delegationsValidatorKey]).toBeTruthy();
        expect(form.valid).toBeFalsy();
      });

    }));

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

      const niveauPrioriteInvalidValue: NiveauPriorite = { id: 0, code: 'INVA', libelle: 'Invalid thématique' };
      prioriteControl.setValue(niveauPrioriteInvalidValue);

      expect(prioriteControl.errors[prioriteValidatorKey]).toBeTruthy();
      expect(form.valid).toBeFalsy();
    });

    it('onSubmit should return emmit the proper object', () => {
      spyOn(componentInstance.searchEventEmitter, 'emit');
      componentInstance.onSubmit(false);
      expect(componentInstance.searchEventEmitter.emit).toHaveBeenCalledWith({
        thematique: null,
        responsableTech: null,
        phase: 'T15',
        priorite: null,
        procedureDecision: null,
        codeServiceDept: null,
        departement: null,
        numeroIncrement: null,
        codeBenef: null,
        pageAAficher: null,
        delegation: null,
        nbElemPerPage: 100000,
        domaine: null,
        natureOperation: null,
        hasReponseNontraite: null
      });
    });

  });
});
