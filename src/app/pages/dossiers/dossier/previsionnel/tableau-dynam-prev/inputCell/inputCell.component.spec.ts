import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MaterialModule } from '../../../../../../../app/theme/material/material.module';

import { InputCellComponent } from './inputCell.component';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe'

describe('InputCellComponent', () => {
    let component: InputCellComponent;
    let fixture: ComponentFixture<InputCellComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialModule,
                BrowserAnimationsModule,
                RouterTestingModule
            ],

            providers: [FormatMonetairePipe],
            declarations: [InputCellComponent],
            schemas: [
                NO_ERRORS_SCHEMA
            ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InputCellComponent);
        component = fixture.componentInstance;
        component.rowData = {
            montantTravauxPrev: 2222,
        };
        fixture.detectChanges();

    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
