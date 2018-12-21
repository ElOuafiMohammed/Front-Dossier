import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { MaterialModule } from '../../../../../../../app/theme/material/material.module';

import { InputCellCofinAideComponent } from './inputCellCofinAide.component';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe'

describe('InputCellCofinComponent', () => {
    let component: InputCellCofinAideComponent;
    let fixture: ComponentFixture<InputCellCofinAideComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialModule,
                BrowserAnimationsModule,
                RouterTestingModule

            ],
            providers: [FormatMonetairePipe],
            declarations: [InputCellCofinAideComponent],
            schemas: [
                NO_ERRORS_SCHEMA
            ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InputCellCofinAideComponent);
        component = fixture.componentInstance;
        component.rowData = {
            montantTravauxPrev: 55555,
        };
        fixture.detectChanges();

    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit the controlForm when data is updated', () => {

        const control = component.control;
        const spyEditApplicationEvent = spyOn(component.editApplicationEvent, 'emit');

        control.setValue(2222);
        component.onMontantAideBlur('2222');

        expect(spyEditApplicationEvent.calls.any()).toBe(true);

    });


});
