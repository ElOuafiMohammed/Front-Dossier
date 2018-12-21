import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgaModule } from 'app/theme/nga.module';

import { Thematique } from '../../create-dossier/create-dossier.interface';

import { DossierService } from '../../dossiers.service';
import { DossierServiceStub } from '../../dossiers.service.spec';
import { ProcedureDecision, NiveauPriorite, Domaine, NatureOperation } from '../../dossier/dossier.interface';
import { TranslateModule } from '@ngx-translate/core';
import { CritereCardPrepareSessionComponent } from 'app/pages/dossiers/prepare-dossier-session/criteres-card-recherche/criteres-card-prepare-session.component';
import { SpinnerLuncher } from '../../../../shared/methodes-generiques';
import { SpinnerLuncherStub } from '../../../../shared/test.helper';

describe('CritereCardPrepareSessionComponent', () => {

    let componentInstance: CritereCardPrepareSessionComponent;
    let fixture: ComponentFixture<CritereCardPrepareSessionComponent>;
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
                    CritereCardPrepareSessionComponent,
                ],
                schemas: [
                    NO_ERRORS_SCHEMA
                ],
                providers: [
                    { provide: DossierService, useClass: DossierServiceStub },
                    { provide: SpinnerLuncher, useClass: SpinnerLuncherStub }
                ]
            });

            fixture = TestBed.createComponent(CritereCardPrepareSessionComponent);
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

        it('should manage an valid operation field value', () => {
            const form = componentInstance.formCritere;
            const naturesOperationControl = componentInstance.natureControl;
            const naturesValidatorKey = componentInstance.naturesValidatorKey;

            dossierService.getNatureOperation(null, null, null, null, null)
                .subscribe(natures => {
                    componentInstance.natures = natures;
                    componentInstance.ngOnChanges();


                    const natureValue: NatureOperation[] = [{ id: 0, ligne: 'ligne', numero: 'numero', libelle: 'Invalid thématique', codeThematique: 'AEEP' }, { id: 0, ligne: 'ligne', numero: 'numero', libelle: 'Invalid thématique', codeThematique: 'AEEP' }];
                    naturesOperationControl.setValue(natureValue);

                    expect(naturesOperationControl.errors[naturesValidatorKey]).toBeTruthy();
                    expect(form.valid).toBeFalsy();
                });

        }
        );

        it('onSubmit should return emmit the proper object', () => {
            spyOn(componentInstance.searchEventEmitter, 'emit');
            componentInstance.onSubmit(false);
            expect(componentInstance.searchEventEmitter.emit).toHaveBeenCalledWith({
                thematique: null,
                domaine: null,
                phase: 'T30',
                priorite: null,
                procedureDecision: null,
                listNatureOperation: null,
                session: null,
                nbElemPerPage: 100000,
            });

        });

    });
});
