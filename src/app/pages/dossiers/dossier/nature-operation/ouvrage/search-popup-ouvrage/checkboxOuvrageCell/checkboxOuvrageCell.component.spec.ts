import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'app/theme/material/material.module';
import { RouterTestingModule } from '@angular/router/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CheckboxOuvrageCellComponent } from './checkboxOuvrageCell.component';


describe('CheckboxCellComponent', () => {
    let component: CheckboxOuvrageCellComponent;
    let fixture: ComponentFixture<CheckboxOuvrageCellComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialModule,
                BrowserAnimationsModule,
                RouterTestingModule

            ],

            declarations: [CheckboxOuvrageCellComponent],
            schemas: [
                NO_ERRORS_SCHEMA
            ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CheckboxOuvrageCellComponent);
        component = fixture.componentInstance;
        component.rowData = {
            checked: true,
        };
        fixture.detectChanges();

    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit true when checkbox change value', () => {
        const spyEditApplicationEvent = spyOn(component.editApplicationEvent, 'emit').and.callThrough();

        component.editApplicationEvent.emit(true)

        expect(spyEditApplicationEvent.calls.any()).toBe(true);

    });


});
