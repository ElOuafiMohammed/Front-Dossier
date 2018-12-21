import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'app/theme/material/material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { ActionsTableauMasseEauComponent } from './actions-tableau.component';

describe('ActionsTableauMasseEauComponent', () => {
  let component: ActionsTableauMasseEauComponent;
  let fixture: ComponentFixture<ActionsTableauMasseEauComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActionsTableauMasseEauComponent],
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionsTableauMasseEauComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the rowData when row is deleted', () => {

    const spyDeleteMasseEauEvent = spyOn(component.deleteMasseEauEvent, 'emit').and.callThrough();

    component.deleteMasseEauEvent.emit(component.rowData)

    expect(spyDeleteMasseEauEvent.calls.any()).toBe(true);

  });
});
