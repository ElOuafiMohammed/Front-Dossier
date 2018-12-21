import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'app/theme/material/material.module';
import { RouterTestingModule } from '@angular/router/testing';

import { MontantRetenuCellComponent } from './montant-retenu-cell.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe'

describe('MontantRetenuCellComponent', () => {
  let component: MontantRetenuCellComponent;
  let fixture: ComponentFixture<MontantRetenuCellComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MontantRetenuCellComponent, FormatMonetairePipe],
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule

      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    });
    beforeEach(() => {
      fixture = TestBed.createComponent(MontantRetenuCellComponent);
      component = fixture.componentInstance;
      component.rowData = {
        libelleCout: 'test',
        montantRetenu: 77777,
        montantEligible: 77777,
        montantOperation: 77777
      };
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should emit the rowData when the control value is updated', () => {
      const control = component.control;
      const numberValue = '45455';

      expect(control.value).toBe(0);

      control.setValue(numberValue);

      component.editApplicationEvent
        .subscribe((outputValue: RowData) => {
          expect(outputValue.montantRetenu).toBe(45455);
        });
      expect(component.rowData.montantRetenu).toBe(45455);
    });

    it('should change the montanat retenu cell when montant plafonne exist', () => {
      const control = component.control;
      const numberValue = '8888';
      expect(control.value).toBe(0);

      control.setValue(numberValue);
      component.montantPlafonNotNull = true;
      expect(component.rowData.montantRetenu).toBe(0);
      expect(component.control.disable).toBeTruthy()

    });

  });

  interface RowData {
    montantRetenu: number
  }
});
