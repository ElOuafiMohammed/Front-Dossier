import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgaModule } from 'app/theme/nga.module';

import { Thematique, Phase } from '../../create-dossier/create-dossier.interface';

import { DossierService } from '../../dossiers.service';
import { DossierServiceStub } from '../../dossiers.service.spec';
import { NiveauPriorite, SessionDecision, } from '../../dossier/dossier.interface';
import { TranslateModule } from '@ngx-translate/core';
import { CritereCardGererPrevisionnelleComponent } from 'app/pages/dossiers/gerer-prevesionnel-dossier/criteres-card/criteres-card-gerer-previsionnelle.component';
import { SpinnerLuncher } from '../../../../shared/methodes-generiques';
import { SpinnerLuncherStub } from '../../../../shared/test.helper';

describe('CritereCardGererPrevisionnelleComponent', () => {

  let componentInstance: CritereCardGererPrevisionnelleComponent;
  let fixture: ComponentFixture<CritereCardGererPrevisionnelleComponent>;
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
          CritereCardGererPrevisionnelleComponent,
        ],
        schemas: [
          NO_ERRORS_SCHEMA
        ],
        providers: [
          { provide: DossierService, useClass: DossierServiceStub },
          { provide: SpinnerLuncher, useClass: SpinnerLuncherStub }
        ]
      });

      fixture = TestBed.createComponent(CritereCardGererPrevisionnelleComponent);
      componentInstance = fixture.componentInstance;
      fixture.detectChanges();
      dossierService = fixture.debugElement.injector.get(DossierService);
    });

    it('should create component', () => {
      expect(componentInstance).toBeTruthy();
    });

    it('should have an invalid form by default (empty)', () => {
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

    it('should manage an invalid Phase field value', () => {
      const form = componentInstance.formCritere;
      const phaseControl = componentInstance.phaseControl;
      const phaseValidatorKey = componentInstance.phaseValidatorKey;
      componentInstance.phases = dossierService.getDomaines();
      componentInstance.ngOnChanges();

      const phaseInvalidValue: Phase = { id: 0, code: 'INVA', libelle: 'Invalid domaine' };
      phaseControl.setValue(phaseInvalidValue);

      expect(phaseControl.errors[phaseValidatorKey]).toBeTruthy();
      expect(form.valid).toBeFalsy();
    });

    it('should manage an invalid session  decision field value', () => {
      const form = componentInstance.formCritere;
      const sessionControl = componentInstance.sessionControl;
      const sessionValidatorKey = componentInstance.sessionValidatorKey;
      dossierService.getSessionPrevisionnel().subscribe(data => {
        componentInstance.sessions = data
      });
      componentInstance.ngOnChanges();

      const procedureDecisionInvalidValue: SessionDecision = { id: 0, annee: '1900', numero: '01', type: 'DD' };
      sessionControl.setValue(procedureDecisionInvalidValue);

      expect(sessionControl.errors[sessionValidatorKey]).toBeTruthy();
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


    it('should manage an invalid Numero Beneficiaire field value', () => {
      const form = componentInstance.formCritere;
      const benefNumberControl = componentInstance.benefNumberControl;
      let benefNumberInvalidValue = null;
      componentInstance.ngOnChanges();

      benefNumberInvalidValue = '12345678ee';
      benefNumberControl.setValue(benefNumberInvalidValue);

      expect(benefNumberControl.errors['maxlength']).toBeTruthy();
      expect(benefNumberControl.errors['pattern']).toBeTruthy();

      benefNumberInvalidValue = '123456780';
      benefNumberControl.setValue(benefNumberInvalidValue);

      expect(benefNumberControl.errors['maxlength']).toBeFalsy();
      expect(benefNumberControl.errors['pattern']).toBeTruthy();
      expect(form.valid).toBeFalsy();
    });

    it('onSubmit should return emmit the proper object', () => {
      spyOn(componentInstance.searchEventEmitter, 'emit');
      componentInstance.onSubmit(false);
      expect(componentInstance.searchEventEmitter.emit).toHaveBeenCalledWith({
        thematique: null,
        phase: null,
        priorite: null,
        annee: null,
        sessionPrev: null,
        codeBenef: null,
        nbElemPerPage: 100000,
        listPhase: ['P00', 'P10', 'P20', 'T10'],
        responsableTech: window.localStorage.getItem('userName'),

      });
    });

  });
});
