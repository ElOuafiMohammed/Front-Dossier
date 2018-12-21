import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'app/theme/material/material.module';
import { RouterTestingModule } from '@angular/router/testing';

import { ActionsCellCofinComponent } from './actionsCellCofin.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';


describe('ActionsCellCofinComponent', () => {
    let component: ActionsCellCofinComponent;
    let fixture: ComponentFixture<ActionsCellCofinComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialModule,
                BrowserAnimationsModule,
                RouterTestingModule

            ],

            declarations: [ActionsCellCofinComponent],
            schemas: [
                NO_ERRORS_SCHEMA
            ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ActionsCellCofinComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit the rowData when row is deleted', () => {
        component.rowData = {
            montantAide: 2222,
        };
        const spyDeleteApplicationEvent = spyOn(component.deleteApplicationEvent, 'emit').and.callThrough();

        component.deleteApplicationEvent.emit(component.rowData.montantAide)

        expect(spyDeleteApplicationEvent.calls.any()).toBe(true);

    });


});
