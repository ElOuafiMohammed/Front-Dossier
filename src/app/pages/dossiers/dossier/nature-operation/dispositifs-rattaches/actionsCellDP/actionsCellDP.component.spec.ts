import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'app/theme/material/material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { ActionsCellDPComponent } from './actionsCellDP.component';

describe('ActionsTableauComponent', () => {
  let component: ActionsCellDPComponent;
  let fixture: ComponentFixture<ActionsCellDPComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActionsCellDPComponent],
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionsCellDPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the rowData when row is deleted', () => {

    const spyDeleteApplicationEvent = spyOn(component.deleteDispositifEvent, 'emit').and.callThrough();

    component.deleteDispositifEvent.emit(component.rowData)

    expect(spyDeleteApplicationEvent.calls.any()).toBe(true);

  });
});
