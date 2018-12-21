import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MaterialModule } from 'app/theme/material/material.module';
// tslint:disable-next-line:import-spacing
import { ActionSessionDecisionComponent }
  from
  'app/pages/dossiers/parametrage/parametrage-dossier/parametrage-session-decision/action-session-decision/action-session-decision.component';

describe('ActionSessionDecisionComponent', () => {
  let component: ActionSessionDecisionComponent;
  let fixture: ComponentFixture<ActionSessionDecisionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActionSessionDecisionComponent],
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionSessionDecisionComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
