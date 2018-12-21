import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { MaterialModule } from '../../../../../../../app/theme/material/material.module';

import { InputCellAideComponent } from './inputCellAide.component';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe'

describe('InputCellAideComponent', () => {
    let component: InputCellAideComponent;
    let fixture: ComponentFixture<InputCellAideComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialModule,
                BrowserAnimationsModule,
                RouterTestingModule

            ],
            providers: [FormatMonetairePipe],
            declarations: [InputCellAideComponent],
            schemas: [
                NO_ERRORS_SCHEMA
            ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InputCellAideComponent);
        component = fixture.componentInstance;
        // component.rowData = {
        //     montantTravauxPrev: 55555,
        // };
        fixture.detectChanges();

    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });


});
