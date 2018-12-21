import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'app/theme/material/material.module';
import { RouterTestingModule } from '@angular/router/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CheckboxCellComponent } from './checkboxCell.component';


describe('CheckboxCellComponent', () => {
    let component: CheckboxCellComponent;
    let fixture: ComponentFixture<CheckboxCellComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialModule,
                BrowserAnimationsModule,
                RouterTestingModule

            ],

            declarations: [CheckboxCellComponent],
            schemas: [
                NO_ERRORS_SCHEMA
            ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CheckboxCellComponent);
        component = fixture.componentInstance;
        component.rowData = {
            checked: true,
        };
        fixture.detectChanges();

    });

    xit('should create', () => {
        expect(component).toBeTruthy();
    });

    xit('should emit true when checkbox change value', () => {
        const spyEditApplicationEvent = spyOn(component.editApplicationEvent, 'emit').and.callThrough();

        component.editApplicationEvent.emit(true)

        expect(spyEditApplicationEvent.calls.any()).toBe(true);

    });


});
