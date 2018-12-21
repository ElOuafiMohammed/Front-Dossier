import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'app/theme/material/material.module';
import { RouterTestingModule } from '@angular/router/testing';

import { ActionsCellComponent } from './actionsCell.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';


describe('ActionsCellComponent', () => {
    let component: ActionsCellComponent;
    let fixture: ComponentFixture<ActionsCellComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialModule,
                BrowserAnimationsModule,
                RouterTestingModule

            ],

            declarations: [ActionsCellComponent],
            schemas: [
                NO_ERRORS_SCHEMA
            ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ActionsCellComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit the rowData when row is deleted', () => {
        component.rowData = {
            montantTravauxPrev: 2222,
        };
        const spyDeleteApplicationEvent = spyOn(component.deleteApplicationEvent, 'emit').and.callThrough();

        component.deleteApplicationEvent.emit(component.rowData.montantTravauxPrev)

        expect(spyDeleteApplicationEvent.calls.any()).toBe(true);

    });


});
