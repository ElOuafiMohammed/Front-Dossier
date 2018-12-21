// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { MaterialModule } from 'app/theme/material/material.module';
// import { RouterTestingModule } from '@angular/router/testing';

// import { PrecisionComponent } from './precision.component';
// import { NO_ERRORS_SCHEMA } from '@angular/core';

// describe('NomCoutCellComponent', () => {
//   let component: NomCoutCellComponent;
//   let fixture: ComponentFixture<NomCoutCellComponent>;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [NomCoutCellComponent],
//       imports: [
//         MaterialModule,
//         BrowserAnimationsModule,
//         RouterTestingModule
//       ],
//       schemas: [
//         NO_ERRORS_SCHEMA
//       ],
//     })
//       .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(NomCoutCellComponent);
//     component = fixture.componentInstance;
//     component.rowData = {
//       libelleCout: 'libelle cout',
//     };
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should emit the controlForm when data is updated', () => {
//     fixture.detectChanges();
//     const control = component.control;
//     const spyEditApplicationEvent = spyOn(component.editApplicationEvent, 'emit');

//     control.setValue('libelle cout');

//     expect(spyEditApplicationEvent.calls.any()).toBe(false);

//   });
// });
