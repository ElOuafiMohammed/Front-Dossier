import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'app/theme/material/material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { CodeMasseEauCellComponent } from './code-masse-eau.component-cell';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

describe('CodeMasseEauCellComponent', () => {
  let component: CodeMasseEauCellComponent;
  let fixture: ComponentFixture<CodeMasseEauCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CodeMasseEauCellComponent],
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeMasseEauCellComponent);
    component = fixture.componentInstance;
    component.value = 'something';
    component.rowData = { test: 'something' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#onBlur should emit the rowData', () => {
    const spyEditCodeMasseEauEvent = spyOn(component.editCodeMasseEauEvent, 'emit').and.callThrough();

    component.onBlur();

    expect(component.isValueModified).toBeTruthy();
    expect(component.isOutOfFocus).toBeTruthy();
    expect(spyEditCodeMasseEauEvent.calls.any()).toBe(true);
  });

  it('#onBlur should emit the rowData', () => {
    component.onFocusEvent();

    expect(component.isOutOfFocus).toBeFalsy();
  });
});
