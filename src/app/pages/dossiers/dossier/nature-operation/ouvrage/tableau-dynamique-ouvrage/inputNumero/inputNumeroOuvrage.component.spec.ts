import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../../../../../../../app/theme/material/material.module';
import { RouterTestingModule } from '@angular/router/testing';


import { NO_ERRORS_SCHEMA } from '@angular/core';
import { InputNumeroOuvrageComponent } from './inputNumeroOuvrage.component';

describe('InputNumeroComponent', () => {
    let component: InputNumeroOuvrageComponent;
    let fixture: ComponentFixture<InputNumeroOuvrageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialModule,
                BrowserAnimationsModule,
                RouterTestingModule

            ],
            declarations: [InputNumeroOuvrageComponent],
            schemas: [
                NO_ERRORS_SCHEMA
            ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InputNumeroOuvrageComponent);
        component = fixture.componentInstance;
        component.rowData = {
            id: 12,
            typeOuvrage: {
                id: 56,
                codeParam: 'TYPE_OUV',
                libelleParam: 'Type d\'ouvrage',
                code: 'EIP',
                libelle: 'Etablissement industriel',
                texte: null
            },
            masseEaux: [],
            codeAgence: '31053100',
            libelle: 'S.C.I. CLINIQUE DE BEAUPUY',
            disable: true,
            libelleEtat: 'libelle'
        };
        fixture.detectChanges();

    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should emit the controlForm when data is updated', () => {

        const ouvrage = {
            id: 12,
            typeOuvrage: {
                id: 56,
                codeParam: 'TYPE_OUV',
                libelleParam: 'Type d\'ouvrage',
                code: 'EIP',
                libelle: 'Etablissement industriel',
                texte: null
            },
            codeAgence: '31053100',
            libelle: 'S.C.I. CLINIQUE DE BEAUPUY',
            disable: true
        };
        const control = component.formOuvrage.get('codeAgence');
        const spyEditApplicationEvent = spyOn(component.updateOuvrageEvent, 'emit');

        control.setValue(ouvrage.codeAgence);
        component.onBlur();
        expect(spyEditApplicationEvent.calls.any()).toBe(true);
    });


});
